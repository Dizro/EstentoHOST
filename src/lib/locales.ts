export const locales = ["en", "ru", "zh"] as const;
export type Locale = (typeof locales)[number];