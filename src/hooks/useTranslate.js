import { useState } from 'react'
import { translateText } from '../utils/api'

export function useTranslate() {
  const [translations, setTranslations] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const translate = async (text, targetLanguage) => {
    setLoading(true)
    setError(null)

    try {
      const result = await translateText(text, targetLanguage)
      setTranslations(prev => ({
        ...prev,
        [targetLanguage]: result
      }))
      return result
    } catch (err) {
      setError(err.message || 'Translation failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    translations,
    loading,
    error,
    translate,
  }
}
