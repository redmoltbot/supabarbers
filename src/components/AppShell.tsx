"use client";
import { useState, useEffect } from "react";
import PinLock from "@/components/PinLock";
import BottomNav from "@/components/BottomNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("pin_unlocked");
    if (stored === "true") setUnlocked(true);
    setChecked(true);

    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved ? saved === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const handleUnlock = () => {
    sessionStorage.setItem("pin_unlocked", "true");
    setUnlocked(true);
  };

  if (!checked) return null;

  if (!unlocked) return <PinLock onUnlock={handleUnlock} />;

  return (
    <>
      <main className="pb-20 min-h-screen">{children}</main>
      <BottomNav />
    </>
  );
}
