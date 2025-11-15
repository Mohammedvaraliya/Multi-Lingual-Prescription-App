import { createContext, useContext, useState } from 'react'

const PrescriptionContext = createContext()

export function PrescriptionProvider({ children }) {
  const [prescription, setPrescription] = useState(null)
  const [ocrText, setOcrText] = useState('')
  const [confidence, setConfidence] = useState(0)
  const [loading, setLoading] = useState(false)

  return (
    <PrescriptionContext.Provider value={{
      prescription,
      setPrescription,
      ocrText,
      setOcrText,
      confidence,
      setConfidence,
      loading,
      setLoading,
    }}>
      {children}
    </PrescriptionContext.Provider>
  )
}

export function usePrescription() {
  const context = useContext(PrescriptionContext)
  if (!context) {
    throw new Error('usePrescription must be used within PrescriptionProvider')
  }
  return context
}
