export const locales = ["en", "pt", "es", "fr", "de", "ar", "hi", "id", "ja", "ko", "zh", "ru", "tr", "pl", "sv", "da", "no", "fi", "uk", "ro", "cs", "el", "he", "th", "vi", "sw", "am", "zu"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
export function matchLocaleFromHeader(acceptLanguage?: string | null): Locale { return defaultLocale; }
