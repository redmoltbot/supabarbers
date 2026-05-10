"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Home", route: "/home", icon: "🏠" },
  { label: "Customers", route: "/customers", icon: "👥" },
  { label: "Cards", route: "/cards", icon: "💳" },
  { label: "Find", route: "/find", icon: "🔍" },
  { label: "Push", route: "/push", icon: "📣" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-30">
      <div className="flex">
        {TABS.map((tab) => {
          const active = pathname === tab.route;
          return (
            <Link
              key={tab.route}
              href={tab.route}
              className={`flex-1 flex flex-col items-center py-3 transition-colors
                ${active
                  ? "text-lime-600 border-t-2 border-lime-500"
                  : "text-gray-500 dark:text-gray-400"}`}
            >
              <span className="text-2xl">{tab.icon}</span>
              <span className="text-xs mt-1 font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
