import i18next from 'i18next';
import en from './en.json';
import de from './de.json';

export async function initI18n(lang?: string) {
  const detected = lang ?? (navigator.language.startsWith('de') ? 'de' : 'en');
  await i18next.init({
    lng: detected,
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
      de: { translation: de },
    },
    interpolation: { escapeValue: false },
  });
}

export const t = (key: string, opts?: Record<string, unknown>) =>
  opts ? i18next.t(key, opts) : i18next.t(key);
export const setLang = (lang: 'en' | 'de') => i18next.changeLanguage(lang);
