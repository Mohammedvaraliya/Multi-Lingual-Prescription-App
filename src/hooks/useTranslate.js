import { useLanguageContext } from "../context/LanguageContext";

export function useTranslate() {
  const { messages, locale, setLocale } = useLanguageContext();

  function t(key) {
    return key.split(".").reduce((obj, k) => obj?.[k], messages) || key;
  }

  return { t, locale, setLocale };
}
