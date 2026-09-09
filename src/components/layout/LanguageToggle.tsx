"use client";

import { useLang } from "@/components/providers/LanguageProvider";
import { cn } from "@/lib/utils";

export function LanguageToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex items-center overflow-hidden rounded-[2px] border border-line text-xs">
      <button
        onClick={() => setLang("fr")}
        aria-pressed={lang === "fr"}
        className={cn(
          "px-2.5 py-1 transition-colors",
          lang === "fr" ? "bg-ink text-cream" : "text-ink-soft hover:text-ink"
        )}
      >
        FR
      </button>
      <button
        onClick={() => setLang("ar")}
        aria-pressed={lang === "ar"}
        className={cn(
          "px-2.5 py-1 font-arabic transition-colors",
          lang === "ar" ? "bg-ink text-cream" : "text-ink-soft hover:text-ink"
        )}
      >
        ع
      </button>
    </div>
  );
}
