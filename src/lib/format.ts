import type { Lang } from "./i18n/dictionaries";

/**
 * Format an amount in Algerian Dinar. Grouping uses French spacing (24 500),
 * which is the convention used across Algerian retail, with a localized
 * currency suffix. Digits stay Western in both languages (Algeria uses Western
 * Arabic numerals).
 */
export function formatDA(amount: number, lang: Lang = "fr"): string {
  const n = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(
    Math.round(amount || 0)
  );
  return lang === "ar" ? `${n} دج` : `${n} DA`;
}

/** Format a date for display in the given language. */
export function formatDate(
  date: Date | string,
  lang: Lang = "fr",
  opts: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" }
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(lang === "ar" ? "ar-DZ" : "fr-DZ", opts).format(d);
}

/** Short relative-ish date + time for admin tables. */
export function formatDateTime(date: Date | string, lang: Lang = "fr"): string {
  return formatDate(date, lang, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
