import en from './locales/en.json';

type Translations = typeof en;
type TranslationKey = keyof Translations;

const locales: Record<string, Translations> = { en };
let current: Translations = en;
let currentLocale = 'en';

export async function setLocale(locale: string): Promise<void> {
  if (!locales[locale]) {
    const module = await import(`./locales/${locale}.json`);
    locales[locale] = module.default;
  }
  current = locales[locale];
  currentLocale = locale;
}

export function getLocale(): string {
  return currentLocale;
}

export function t(key: TranslationKey): string {
  return current[key] ?? key;
}
