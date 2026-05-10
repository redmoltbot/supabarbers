"use client";
import { useEffect, useState } from "react";
import CustomerModal from "@/components/CustomerModal";

type CardRow = {
  id: string;
  createdAt: string;
  customer: {
    id: string;
    firstName: string;
    surname: string | null;
    phone: string | null;
    email: string | null;
  };
};

const PAGE_SIZE = 30;

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export default function CustomersPage() {
  const [cards, setCards] = useState<CardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const fetchCards = async () => {
    setPage(1);
    setLoading(true);
    try {
      const res = await fetch("/api/cards?templateId=1094541&page=1&itemsPerPage=100");
      const data = await res.json();
      setCards(data.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const paged = cards.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(cards.length / PAGE_SIZE);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Customers
        </h1>
        <button
          onClick={fetchCards}
          className="py-2 px-4 rounded-xl bg-lime-500 text-white font-bold text-base"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-xl text-gray-500">
          Loading...
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {paged.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c.id)}
                className="w-full text-left p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 active:scale-95 transition-transform"
              >
                <div className="flex justify-between items-start">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {c.customer.firstName} {c.customer.surname || ""}
                  </span>
                  <span className="text-sm text-gray-400 ml-2 shrink-0">
                    {formatDate(c.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 flex-wrap">
                  <span className="font-mono text-lime-600 font-medium">{c.id}</span>
                  <span>·</span>
                  <span>{c.customer.phone || "—"}</span>
                  {c.customer.email && (
                    <>
                      <span>·</span>
                      <span className="truncate">{c.customer.email}</span>
                    </>
                  )}
                </div>
              </button>
            ))}
            {cards.length === 0 && (
              <div className="text-center py-12 text-gray-500 text-lg">
                No customers found.
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-3 mt-6">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="py-2 px-5 rounded-xl bg-gray-200 dark:bg-gray-700 dark:text-white font-bold disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="py-2 px-4 text-gray-600 dark:text-gray-300">
                {page} / {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="py-2 px-5 rounded-xl bg-gray-200 dark:bg-gray-700 dark:text-white font-bold disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {selected && (
        <CustomerModal
          serialNumber={selected}
          onClose={() => {
            setSelected(null);
            fetchCards();
          }}
        />
      )}
    </div>
  );
}
