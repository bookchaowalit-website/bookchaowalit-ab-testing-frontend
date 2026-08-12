"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

function Shell({
  title,
  subtitle,
  badge = "Portfolio demo · local-only",
  children,
}: {
  title: string;
  subtitle: string;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-8">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{badge}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">{subtitle}</p>
        </header>
        {children}
        <footer className="mt-10 border-t border-zinc-200 pt-4 text-xs text-zinc-500 dark:border-zinc-800">
          Honest demo: no multi-tenant backend. State (if any) stays in this browser.
        </footer>
      </div>
    </div>
  );
}

function Button({
  children,
  onClick,
  variant = "primary",
  disabled,
  type = "button",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 " +
    className;
  const styles =
    variant === "primary"
      ? "bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
      : variant === "secondary"
        ? "bg-white text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-700"
        : variant === "danger"
          ? "bg-red-600 text-white hover:bg-red-500"
          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900";
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${styles}`}>
      {children}
    </button>
  );
}

const inputClass =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950";

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw != null) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, [key]);
  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value, ready]);
  return [value, setValue] as const;
}

function uid() {
  return crypto.randomUUID();
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}


type Variant = { id: string; name: string; weight: number; conversions: number; views: number };
export default function Home() {
  const [variants, setVariants] = useLocalStorage<Variant[]>("ab-testing-v1", [
    { id: "a", name: "Control", weight: 50, conversions: 12, views: 200 },
    { id: "b", name: "Variant B", weight: 50, conversions: 18, views: 190 },
  ]);
  const totalW = variants.reduce((a, v) => a + v.weight, 0) || 1;
  const pick = () => {
    let r = Math.random() * totalW;
    for (const v of variants) {
      r -= v.weight;
      if (r <= 0) {
        setVariants((prev) => prev.map((x) => (x.id === v.id ? { ...x, views: x.views + 1 } : x)));
        return;
      }
    }
  };
  const convert = (id: string) =>
    setVariants((prev) => prev.map((x) => (x.id === id ? { ...x, conversions: x.conversions + 1 } : x)));
  return (
    <Shell title="A/B Testing" subtitle="Simulate weighted variant traffic and conversion rates locally.">
      <div className="mb-4 flex gap-2">
        <Button onClick={pick}>Simulate visit</Button>
        <Button variant="secondary" onClick={() => { for (let i = 0; i < 50; i++) pick(); }}>Simulate 50</Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {variants.map((v) => {
          const rate = v.views ? ((v.conversions / v.views) * 100).toFixed(1) : "0.0";
          return (
            <div key={v.id} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex justify-between"><h2 className="font-medium">{v.name}</h2><span className="text-sm text-zinc-500">w={v.weight}</span></div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                <div><div className="text-xs text-zinc-500">Views</div><div className="text-xl font-semibold">{v.views}</div></div>
                <div><div className="text-xs text-zinc-500">Conv</div><div className="text-xl font-semibold">{v.conversions}</div></div>
                <div><div className="text-xs text-zinc-500">Rate</div><div className="text-xl font-semibold">{rate}%</div></div>
              </div>
              <div className="mt-3"><Button variant="secondary" onClick={() => convert(v.id)}>+ Conversion</Button></div>
            </div>
          );
        })}
      </div>
    </Shell>
  );
}
