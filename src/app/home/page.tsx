"use client";
import { useState, useEffect } from "react";
import Toast, { useToast } from "@/components/Toast";
import ActivityLogComp from "@/components/ActivityLog";
import ThemeToggle from "@/components/ThemeToggle";
import { addLogEntry } from "@/lib/activityLog";

export default function HomePage() {
  const [cardNum, setCardNum] = useState("");
  const [stampsStr, setStampsStr] = useState("1");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalCustomers, setTotalCustomers] = useState<number | null>(null);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    fetch("/api/cards?templateId=1094518&page=1&itemsPerPage=100")
      .then((r) => r.json())
      .then((d) => {
        const count = d.meta?.totalItems ?? d.data?.length ?? null;
        setTotalCustomers(count);
      })
      .catch(() => {});
  }, []);

  const handleStamp = async (action: "add-stamp" | "subtract-stamp") => {
    if (!cardNum.trim()) {
      showToast("Enter a card number", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/cards/${cardNum.trim()}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: cardNum.trim(),
          stamps: Math.max(1, parseInt(stampsStr) || 1),
          comment,
          purchaseSum: 0.1,
        }),
      });
      if (!res.ok) throw new Error();
      addLogEntry({
        cardNumber: cardNum.trim(),
        action,
        count: Math.max(1, parseInt(stampsStr) || 1),
        comment,
      });
      const stamps = Math.max(1, parseInt(stampsStr) || 1);
      showToast(
        `${action === "subtract-stamp" ? "Redeemed" : "Topped up"} ${stamps} haircut${stamps !== 1 ? "s" : ""}`,
        "success"
      );
      setCardNum("");
      setStampsStr("1");
      setComment("");
    } catch {
      showToast("Action failed. Check card number.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          SupaBarbers
        </h1>
        <ThemeToggle />
      </div>

      {/* Action Form */}
      <div className="space-y-4 mb-6">
        <input
          type="text"
          placeholder="Serial Card Number"
          value={cardNum}
          onChange={(e) => setCardNum(e.target.value)}
          className="w-full text-xl p-4 rounded-xl border-2 border-gray-300 focus:border-lime-500 focus:outline-none dark:bg-gray-800 dark:text-white dark:border-gray-600"
        />
        <input
          type="number"
          min={1}
          value={stampsStr}
          onChange={(e) => setStampsStr(e.target.value)}
          onBlur={() => {
            const n = parseInt(stampsStr);
            if (!stampsStr || n < 1 || isNaN(n)) setStampsStr("1");
          }}
          className="w-full text-xl p-4 rounded-xl border-2 border-gray-300 focus:border-lime-500 focus:outline-none dark:bg-gray-800 dark:text-white dark:border-gray-600"
        />
        <input
          type="text"
          placeholder="Comment (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full text-xl p-4 rounded-xl border-2 border-gray-300 focus:border-lime-500 focus:outline-none dark:bg-gray-800 dark:text-white dark:border-gray-600"
        />
        <div className="flex gap-3">
          <button
            onClick={() => handleStamp("subtract-stamp")}
            disabled={loading}
            className="flex-1 py-4 px-6 text-xl font-bold rounded-2xl bg-lime-500 text-white disabled:opacity-50 active:scale-95 transition-transform"
          >
            {loading ? "..." : "✂ Redeem"}
          </button>
          <button
            onClick={() => handleStamp("add-stamp")}
            disabled={loading}
            className="flex-1 py-4 px-6 text-xl font-bold rounded-2xl bg-yellow-400 text-gray-900 disabled:opacity-50 active:scale-95 transition-transform"
          >
            {loading ? "..." : "+ Top Up"}
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 text-center">
          <div className="text-3xl font-bold text-lime-600">
            {totalCustomers ?? "—"}
          </div>
          <div className="text-sm text-gray-500 mt-1">Total Customers</div>
        </div>
        <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 text-center">
          <div className="text-3xl font-bold text-yellow-500">
            {totalCustomers ?? "—"}
          </div>
          <div className="text-sm text-gray-500 mt-1">Cards Issued</div>
        </div>
      </div>

      {/* Telegram Button */}
      <a
        href="https://t.me/"
        target="_blank"
        rel="noreferrer"
        className="block w-full py-4 px-6 text-xl font-bold rounded-2xl bg-yellow-400 text-gray-900 text-center mb-6 active:scale-95 transition-transform"
      >
        Connect to Telegram
      </a>

      {/* Activity Log */}
      <ActivityLogComp />
    </div>
  );
}
