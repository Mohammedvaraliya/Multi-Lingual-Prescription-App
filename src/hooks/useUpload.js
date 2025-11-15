import { useState } from 'react'
import { uploadPrescription } from '../utils/api'

export function useUpload() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return

    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    setFile(selectedFile)
    setError(null)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target.result)
    }
    reader.readAsDataURL(selectedFile)
  }

  const handleUpload = async (language) => {
    if (!file) {
      setError('No file selected')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const result = await uploadPrescription(file, language)
      return result
    } catch (err) {
      setError(err.message || 'Upload failed')
      throw err
    } finally {
      setUploading(false)
    }
  }

  return {
    file,
    preview,
    uploading,
    error,
    handleFileSelect,
    handleUpload,
  }
}
