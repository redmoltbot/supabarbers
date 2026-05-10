"use client";
import { useEffect, useState } from "react";
import CustomerModal from "@/components/CustomerModal";

type CardRow = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: string | null;
  device: string | null;
  balance: {
    currentNumberOfUses: number;
    numberStampsTotal: number;
    stampsBeforeReward: number;
  } | null;
  customerId: string | null;
  customer: {
    firstName: string;
    surname: string | null;
    phone: string | null;
    email: string | null;
  };
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}


function exportCSV(cards: CardRow[]) {
  const today = new Date().toISOString().slice(0, 10);
  const headers = ["Card ID", "Customer ID", "Customer Name", "Phone", "Email", "Last Active", "Haircuts Remaining", "Status", "Device"];
  const rows = cards.map((c) => [
    c.id,
    c.customerId ?? "",
    `${c.customer.firstName} ${c.customer.surname ?? ""}`.trim(),
    c.customer.phone ?? "",
    c.customer.email ?? "",
    c.updatedAt ?? "",
    String(c.balance?.currentNumberOfUses ?? 0),
    c.status ?? "",
    c.device ?? "",
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((v) => `"${v.replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `cards_export_${today}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function CardsPage() {
  const [cards, setCards] = useState<CardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  // filter state
  const [toDate, setToDate] = useState("");
  const [minStamps, setMinStamps] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "installed" | "not_installed">("");

  const fetchCards = () => {
    setLoading(true);
    fetch("/api/cards?templateId=1094518&page=1&itemsPerPage=100")
      .then((r) => r.json())
      .then((d) => setCards(d.data ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const filtered = cards.filter((c) => {
    if (toDate) {
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      if (new Date(c.updatedAt) > end) return false;
    }
    if (minStamps !== "") {
      const min = parseInt(minStamps, 10);
      if (!isNaN(min) && min > 0) {
        const total = c.balance?.currentNumberOfUses ?? 0;
        if (total < min) return false;
      }
    }
    if (statusFilter !== "") {
      if (c.status !== statusFilter) return false;
    }
    return true;
  });

  const hasFilters = toDate || (minStamps !== "" && minStamps !== "0") || statusFilter !== "";

  const clearFilters = () => {
    setToDate("");
    setMinStamps("");
    setStatusFilter("");
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Cards
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => exportCSV(filtered)}
            className="py-2 px-4 rounded-xl bg-blue-500 text-white font-bold text-base"
          >
            Export CSV
          </button>
          <button
            onClick={fetchCards}
            className="py-2 px-4 rounded-xl bg-lime-500 text-white font-bold text-base"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Not active since
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Min. Haircuts Remaining
            </label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={minStamps}
              onChange={(e) => setMinStamps(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Card Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "" | "installed" | "not_installed")}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm"
            >
              <option value="">All</option>
              <option value="installed">Installed</option>
              <option value="not_installed">Not Installed</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filtered.length} of {cards.length} cards
          </span>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-500 font-medium hover:text-red-600"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-xl text-gray-500">
          Loading...
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(c.id)}
              className="w-full text-left p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 active:scale-95 transition-transform"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {c.customer.firstName} {c.customer.surname || ""}
                  </div>
                  <div className="text-base text-gray-500 mt-0.5">
                    {c.customer.phone || "No phone"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-lime-600 text-base font-medium">
                    {c.id}
                  </div>
                  <div className="text-sm text-gray-400 mt-0.5">
                    Last active: {formatDate(c.updatedAt)}
                  </div>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <div>
                  <span className="text-gray-400">Haircuts remaining: </span>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {c.balance?.currentNumberOfUses ?? 0}
                  </span>
                </div>
                {c.device && (
                  <div>
                    <span className="text-gray-400">Device: </span>
                    <span className="text-gray-700 dark:text-gray-300">{c.device}</span>
                  </div>
                )}
                {c.status && (
                  <div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                        c.status === "installed"
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                      }`}
                    >
                      {c.status === "not_installed" ? "Not Installed" : c.status}
                    </span>
                  </div>
                )}
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500 text-lg">
              {cards.length === 0 ? "No cards found." : "No cards match the current filters."}
            </div>
          )}
        </div>
      )}

      {selected && (
        <CustomerModal
          serialNumber={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
