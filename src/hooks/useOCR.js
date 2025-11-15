import { useState } from 'react'
import { extractOCRText, parseOCR } from '../utils/api'

export function useOCR() {
  const [extractedText, setExtractedText] = useState('')
  const [parsedData, setParsedData] = useState(null)
  const [confidence, setConfidence] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const extract = async (imageFile) => {
    setLoading(true)
    setError(null)

    try {
      const result = await extractOCRText(imageFile)
      setExtractedText(result.text)
      setConfidence(result.confidence)
      return result
    } catch (err) {
      setError(err.message || 'OCR extraction failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const parse = async (text) => {
    setLoading(true)
    setError(null)

    try {
      const result = await parseOCR(text)
      setParsedData(result)
      return result
    } catch (err) {
      setError(err.message || 'Parsing failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    extractedText,
    setExtractedText,
    parsedData,
    confidence,
    loading,
    error,
    extract,
    parse,
  }
}
