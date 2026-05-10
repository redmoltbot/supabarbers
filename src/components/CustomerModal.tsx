"use client";
import { useState, useEffect } from "react";
import type { CardInfo } from "@/types";
import StampPanel from "@/components/StampPanel";
import Toast, { useToast } from "@/components/Toast";
import { addLogEntry } from "@/lib/activityLog";

interface CustomerModalProps {
  serialNumber: string;
  onClose: () => void;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export default function CustomerModal({
  serialNumber,
  onClose,
}: CustomerModalProps) {
  const [card, setCard] = useState<CardInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    surname: "",
    phone: "",
    email: "",
  });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<null | "card" | "customer">(null);
  const { toast, showToast, hideToast } = useToast();

  const fetchCard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cards/${serialNumber}`);
      if (!res.ok) throw new Error();
      const data: CardInfo = await res.json();
      setCard(data);
      setEditForm({
        firstName: data.customer.firstName || "",
        surname: data.customer.surname || "",
        phone: data.customer.phone || "",
        email: data.customer.email || "",
      });
    } catch {
      setCard(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serialNumber]);

  const handleSubtractReward = async () => {
    try {
      const res = await fetch(`/api/cards/${serialNumber}/subtract-reward`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: serialNumber,
          rewards: 1,
          comment: "",
          purchaseSum: 0.1,
        }),
      });
      if (!res.ok) throw new Error();
      addLogEntry({
        cardNumber: serialNumber,
        action: "subtract-reward",
        count: 1,
        comment: "",
      });
      showToast("Free cut used", "success");
      fetchCard();
    } catch {
      showToast("Failed to use free cut", "error");
    }
  };

  const handleSaveEdit = async () => {
    if (!card) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/customers/${card.customer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error();
      showToast("Customer updated", "success");
      setEditing(false);
      fetchCard();
    } catch {
      showToast("Update failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCard = async () => {
    try {
      const res = await fetch(`/api/cards/${serialNumber}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      onClose();
    } catch {
      showToast("Delete failed", "error");
    }
  };

  const handleDeleteCustomer = async () => {
    if (!card) return;
    try {
      const res = await fetch(`/api/customers/${card.customer.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      onClose();
    } catch {
      showToast("Delete failed", "error");
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={hideToast}
          />
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Card Details
          </h2>
          <button
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-gray-700 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-xl text-gray-500">
            Loading...
          </div>
        ) : !card ? (
          <div className="text-center py-16 text-xl text-red-500">
            Failed to load card data.
          </div>
        ) : (
          <div className="space-y-5">
            {/* Card Stats */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 grid grid-cols-2 gap-3 text-base">
              <span className="text-gray-500">Serial #</span>
              <span className="font-mono font-medium dark:text-white break-all">
                {card.serialNumber}
              </span>
              <span className="text-gray-500">Haircuts Left</span>
              <span className="font-bold text-lime-600 text-2xl">
                {card.stamps}
              </span>
              <span className="text-gray-500">Free Cuts</span>
              <span className="font-bold text-yellow-500 text-2xl">
                {card.rewards}
              </span>
              <span className="text-gray-500">Joined</span>
              <span className="dark:text-white">{formatDate(card.createdAt)}</span>
              {card.downloadUrl && (
                <>
                  <span className="text-gray-500">Download</span>
                  <a
                    href={card.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-lime-600 underline"
                  >
                    Open link
                  </a>
                </>
              )}
              {card.comment && (
                <>
                  <span className="text-gray-500">Comment</span>
                  <span className="dark:text-white">{card.comment}</span>
                </>
              )}
            </div>

            {/* Customer Info */}
            {editing ? (
              <div className="space-y-3">
                <h3 className="text-lg font-bold dark:text-white">
                  Edit Customer
                </h3>
                {(
                  [
                    { field: "firstName", label: "First Name", type: "text" },
                    { field: "surname", label: "Surname", type: "text" },
                    { field: "phone", label: "Phone", type: "tel" },
                    { field: "email", label: "Email", type: "email" },
                  ] as const
                ).map(({ field, label, type }) => (
                  <input
                    key={field}
                    type={type}
                    placeholder={label}
                    value={editForm[field]}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, [field]: e.target.value }))
                    }
                    className="w-full text-lg p-3 rounded-xl border-2 border-gray-300 focus:border-lime-500 focus:outline-none dark:bg-gray-800 dark:text-white dark:border-gray-600"
                  />
                ))}
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveEdit}
                    disabled={saving}
                    className="flex-1 py-4 rounded-2xl bg-lime-500 text-white font-bold text-lg disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="flex-1 py-4 rounded-2xl bg-gray-200 dark:bg-gray-700 font-bold text-lg dark:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 grid grid-cols-2 gap-3 text-base">
                <span className="text-gray-500">Name</span>
                <span className="dark:text-white font-medium">
                  {card.customer.firstName} {card.customer.surname || ""}
                </span>
                <span className="text-gray-500">Phone</span>
                <span className="dark:text-white">
                  {card.customer.phone || "—"}
                </span>
                <span className="text-gray-500">Email</span>
                <span className="dark:text-white break-all">
                  {card.customer.email || "—"}
                </span>
                <span className="text-gray-500">Customer ID</span>
                <span className="dark:text-white font-mono text-sm break-all">
                  {card.customer.id}
                </span>
                {card.customer.externalUserId && (
                  <>
                    <span className="text-gray-500">External ID</span>
                    <span className="dark:text-white font-mono text-sm">
                      {card.customer.externalUserId}
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Haircut Actions */}
            <div>
              <h3 className="text-lg font-bold mb-3 dark:text-white">
                Haircut Credits
              </h3>
              <StampPanel cardId={serialNumber} onSuccess={fetchCard} />
            </div>

            {/* Use Free Cut */}
            <button
              onClick={handleSubtractReward}
              className="w-full py-4 px-6 text-xl font-bold rounded-2xl bg-yellow-400 text-gray-900 active:scale-95 transition-transform"
            >
              Use Free Cut
            </button>

            {/* Management Actions */}
            {confirmDelete ? (
              <div className="bg-red-50 dark:bg-red-900/30 rounded-2xl p-4 space-y-3">
                <p className="text-base font-semibold text-red-700 dark:text-red-400 text-center">
                  {confirmDelete === "card"
                    ? "Permanently delete this card?"
                    : "Permanently delete this customer and all their data?"}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      if (confirmDelete === "card") handleDeleteCard();
                      else handleDeleteCustomer();
                    }}
                    className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-base active:scale-95 transition-transform"
                  >
                    Yes, delete
                  </button>
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="flex-1 py-3 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-bold text-base active:scale-95 transition-transform"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 pt-2">
                <button
                  onClick={() => setEditing(true)}
                  className="py-3 rounded-xl border-2 border-lime-500 text-lime-600 font-bold text-base active:scale-95 transition-transform"
                >
                  Edit
                </button>
                <button
                  onClick={() => setConfirmDelete("card")}
                  className="py-3 rounded-xl border-2 border-red-400 text-red-500 font-bold text-base active:scale-95 transition-transform"
                >
                  Del Card
                </button>
                <button
                  onClick={() => setConfirmDelete("customer")}
                  className="py-3 rounded-xl bg-red-500 text-white font-bold text-base active:scale-95 transition-transform"
                >
                  Del Customer
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
