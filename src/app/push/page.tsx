"use client";
import { useState, useEffect } from "react";
import Toast, { useToast } from "@/components/Toast";

type PushRecord = {
  id: string | number;
  message: string;
  createdAt: string;
  cardId: string | null;
  scheduledAt: string | null;
  status?: string;
};

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function PushPage() {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<PushRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const { toast, showToast, hideToast } = useToast();

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/pushes?page=1&itemsPerPage=30");
      const data = await res.json();
      setHistory(data.data ?? []);
    } catch {
      // silently fail
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSend = async () => {
    if (!message.trim()) {
      showToast("Enter a message", "error");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/pushes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() }),
      });
      if (!res.ok) throw new Error();
      showToast("Push notification sent", "success");
      setMessage("");
      fetchHistory();
    } catch {
      showToast("Failed to send notification", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Push Notifications
      </h1>

      {/* Send Section */}
      <div className="space-y-3 mb-8">
        <textarea
          placeholder="Type your message to all cardholders..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="w-full text-xl p-4 rounded-xl border-2 border-gray-300 focus:border-lime-500 focus:outline-none dark:bg-gray-800 dark:text-white dark:border-gray-600 resize-none"
        />
        <button
          onClick={handleSend}
          disabled={sending}
          className="w-full py-4 px-6 text-xl font-bold rounded-2xl bg-lime-500 text-white disabled:opacity-50 active:scale-95 transition-transform"
        >
          {sending ? "Sending..." : "Send to All Cardholders"}
        </button>
      </div>

      {/* History Section */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Previously Sent
        </h2>
        <button
          onClick={fetchHistory}
          className="py-2 px-4 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-sm"
        >
          Refresh
        </button>
      </div>

      {loadingHistory ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : history.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-lg">
          No notifications sent yet.
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((p) => (
            <div
              key={p.id}
              className="p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
            >
              <p className="text-base text-gray-900 dark:text-white font-medium">
                {p.message}
              </p>
              <div className="flex justify-between items-center mt-2 text-sm text-gray-400">
                <span>{formatDateTime(p.createdAt)}</span>
                {p.status && (
                  <span className="capitalize">{p.status}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
