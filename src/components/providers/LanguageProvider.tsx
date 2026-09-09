"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  DEFAULT_LANG,
  LANG_COOKIE,
  dirFor,
  getDictionary,
  type Dictionary,
  type Lang,
} from "@/lib/i18n/dictionaries";

interface LangContextValue {
  lang: Lang;
  dir: "ltr" | "rtl";
  t: Dictionary;
  setLang: (l: Lang) => void;
  toggle: () => void;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LanguageProvider({
  initialLang = DEFAULT_LANG,
  children,
}: {
  initialLang?: Lang;
  children: ReactNode;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const router = useRouter();

  const setLang = useCallback(
    (l: Lang) => {
      setLangState(l);
      // Persist for a year and update the document direction immediately.
      document.cookie = `${LANG_COOKIE}=${l}; path=/; max-age=${60 * 60 * 24 * 365}`;
      document.documentElement.lang = l;
      document.documentElement.dir = dirFor(l);
      // Re-render server components so their copy follows the new language.
      router.refresh();
    },
    [router]
  );

  const toggle = useCallback(() => setLang(lang === "fr" ? "ar" : "fr"), [lang, setLang]);

  const value = useMemo<LangContextValue>(
    () => ({ lang, dir: dirFor(lang), t: getDictionary(lang), setLang, toggle }),
    [lang, setLang, toggle]
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within a LanguageProvider");
  return ctx;
}
