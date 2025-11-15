import { useLanguage } from '../context/LanguageContext'

export function LanguageSelector() {
  const { selectedLanguage, setSelectedLanguage, availableLanguages } = useLanguage()

  return (
    <div className="w-full">
      <label className="block text-lg font-semibold text-gray-900 mb-3">
        Choose Your Language
      </label>
      <select
        value={selectedLanguage}
        onChange={(e) => setSelectedLanguage(e.target.value)}
        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base font-medium focus:outline-none focus:border-blue-600 min-h-12"
      >
        {Object.entries(availableLanguages).map(([code, name]) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select>
    </div>
  )
}
