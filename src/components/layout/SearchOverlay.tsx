"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useUI } from "@/store/ui";
import { useLang } from "@/components/providers/LanguageProvider";

export function SearchOverlay() {
  const { searchOpen, closeSearch } = useUI();
  const { t } = useLang();
  const router = useRouter();
  const [q, setQ] = useState("");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeSearch();
    }
    if (searchOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [searchOpen, closeSearch]);

  if (!searchOpen) return null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    closeSearch();
    router.push(query ? `/shop?q=${encodeURIComponent(query)}` : "/shop");
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink/40 animate-fade-in" onClick={closeSearch} />
      <div className="relative z-10 animate-rise border-b border-line bg-cream">
        <form onSubmit={submit} className="container-content flex items-center gap-4 py-6">
          <Search className="h-5 w-5 shrink-0 text-ink-soft" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.nav.searchPlaceholder}
            className="flex-1 bg-transparent py-1 text-lg placeholder:text-ink-soft/60 focus:outline-none"
          />
          <button
            type="button"
            onClick={closeSearch}
            aria-label={t.common.close}
            className="text-ink-soft hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
