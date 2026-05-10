"use client";
import { useEffect, useState } from "react";
import CustomerModal from "@/components/CustomerModal";

type CardRow = {
  id: string;
  customer: {
    firstName: string;
    surname: string | null;
    phone: string | null;
    email: string | null;
  };
};

export default function FindPage() {
  const [query, setQuery] = useState("");
  const [cards, setCards] = useState<CardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/cards?templateId=1094541&page=1&itemsPerPage=100")
      .then((r) => r.json())
      .then((d) => setCards(d.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  const results = query.trim()
    ? cards.filter((c) => {
        const q = query.toLowerCase();
        return (
          `${c.customer.firstName} ${c.customer.surname || ""}`.toLowerCase().includes(q) ||
          (c.customer.phone || "").includes(q) ||
          (c.customer.email || "").toLowerCase().includes(q)
        );
      })
    : [];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Find
      </h1>
      <input
        type="search"
        placeholder="Search by name, phone, or email"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full text-xl p-4 rounded-xl border-2 border-gray-300 focus:border-lime-500 focus:outline-none dark:bg-gray-800 dark:text-white dark:border-gray-600 mb-4"
        autoFocus
      />

      {loading && (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      )}

      {!loading && query.trim() && results.length === 0 && (
        <div className="text-center py-8 text-gray-500 text-lg">
          No results found.
        </div>
      )}

      {!loading && !query.trim() && (
        <div className="text-center py-8 text-gray-400 text-lg">
          Start typing to search customers.
        </div>
      )}

      <div className="space-y-3">
        {results.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelected(c.id)}
            className="w-full text-left p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 active:scale-95 transition-transform"
          >
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {c.customer.firstName} {c.customer.surname || ""}
            </div>
            <div className="text-base text-gray-500">
              {c.customer.phone || "No phone"} · {c.customer.email || "No email"}
            </div>
            <div className="text-sm font-mono text-lime-600 mt-1">{c.id}</div>
          </button>
        ))}
      </div>

      {selected && (
        <CustomerModal
          serialNumber={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
