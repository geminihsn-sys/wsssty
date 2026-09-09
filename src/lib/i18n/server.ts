import "server-only";
import { cookies } from "next/headers";
import {
  DEFAULT_LANG,
  LANG_COOKIE,
  getDictionary,
  isLang,
  type Lang,
} from "./dictionaries";

/** Read the active language from the cookie (for server components). */
export function getServerLang(): Lang {
  const value = cookies().get(LANG_COOKIE)?.value;
  return isLang(value) ? value : DEFAULT_LANG;
}

/** Convenience: server-side language + dictionary in one call. */
export function getServerDict() {
  const lang = getServerLang();
  return { lang, t: getDictionary(lang) };
}
