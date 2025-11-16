import { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState("en");
  const [messages, setMessages] = useState({});

  // Load all translation files (Vite feature)
  const translations = import.meta.glob("../locales/*.json", { eager: true });

  useEffect(() => {
    const filePath = `../locales/${locale}.json`;

    if (translations[filePath]) {
      setMessages(translations[filePath].default);
    } else {
      console.warn(`Translation file not found: ${filePath}`);
      setMessages({});
    }
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, messages }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguageContext() {
  return useContext(LanguageContext);
}
