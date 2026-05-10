"use client";
import { useEffect, useState } from "react";
import { getLog } from "@/lib/activityLog";
import type { ActivityLog } from "@/types";

export default function ActivityLogComp() {
  const [log, setLog] = useState<ActivityLog[]>([]);

  useEffect(() => {
    setLog(getLog());
  }, []);

  if (log.length === 0) {
    return (
      <p className="text-gray-400 text-center py-4">No recent activity.</p>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
        Recent Activity
      </h2>
      <div className="space-y-2">
        {log.map((entry) => (
          <div
            key={entry.id}
            className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800"
          >
            <div className="flex justify-between items-center">
              <span
                className={`font-semibold text-base ${
                  entry.action === "add-stamp"
                    ? "text-lime-600"
                    : "text-red-500"
                }`}
              >
                {entry.action === "add-stamp" ? "+" : "-"}
                {entry.count} stamp{entry.count !== 1 ? "s" : ""}
                {entry.action === "subtract-reward" ? " (reward)" : ""}
              </span>
              <span className="text-gray-400 text-sm">
                {new Date(entry.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="text-gray-500 text-sm">
              Card: {entry.cardNumber}
            </div>
            {entry.comment && (
              <div className="text-gray-400 text-sm">{entry.comment}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
