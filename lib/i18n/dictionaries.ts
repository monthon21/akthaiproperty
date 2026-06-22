import th from "./th.json";
import en from "./en.json";
import zh from "./zh.json";

export type Locale = "th" | "en" | "zh";

export const defaultLocale: Locale = "th";
export const locales: Locale[] = ["th", "en", "zh"];

const dictionaries = {
  th,
  en,
  zh,
};

export async function getDictionary(locale: Locale) {
  // Gracefully fallback to defaultLocale if matching locale dictionary is not found
  return dictionaries[locale] || dictionaries[defaultLocale];
}
