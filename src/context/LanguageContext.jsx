import { createContext, useContext, useState } from 'react'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [selectedLanguage, setSelectedLanguage] = useState('en')

  const availableLanguages = {
    en: 'English',
    hi: 'हिन्दी (Hindi)',
    gu: 'ગુજરાતી (Gujarati)',
    mr: 'मराठी (Marathi)',
    ta: 'தமிழ் (Tamil)',
    te: 'తెలుగు (Telugu)',
    kn: 'ಕನ್ನಡ (Kannada)',
    ml: 'മലയാളം (Malayalam)',
  }

  return (
    <LanguageContext.Provider value={{ selectedLanguage, setSelectedLanguage, availableLanguages }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
