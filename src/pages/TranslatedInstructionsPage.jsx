import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useTranslate } from '../hooks/useTranslate'
import { useAudio } from '../hooks/useAudio'
import { AudioPlayer } from '../components/AudioPlayer'
import { getSimplifiedInstructions, generateAudio } from '../utils/api'
import { PrescriptionSkeleton } from '../components/LoadingSkeletons'

export default function TranslatedInstructionsPage() {
  const navigate = useNavigate()
  const { selectedLanguage } = useLanguage()
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [translating, setTranslating] = useState(false)
  const [generatingAudio, setGeneratingAudio] = useState(false)
  const [instructions, setInstructions] = useState('')
  const [translatedInstructions, setTranslatedInstructions] = useState('')
  const [audioUrl, setAudioUrl] = useState('')

  useEffect(() => {
    // Get medicines from sessionStorage
    const stored = sessionStorage.getItem('parsedPrescription')
    if (stored) {
      try {
        const data = JSON.parse(stored)
        setMedicines(data.medicines || [])
        
        // Generate simplified instructions
        const inst = getSimplifiedInstructions(data.medicines || [], selectedLanguage)
        setInstructions(inst)
        
        if (selectedLanguage !== 'en') {
          translateInstructions(inst)
        } else {
          setTranslatedInstructions(inst)
        }
        
        setLoading(false)
      } catch (err) {
        console.error('Failed to load data')
        setLoading(false)
      }
    }
  }, [selectedLanguage])

  const translateInstructions = async (text) => {
    setTranslating(true)
    try {
      // Mock translation
      const translated = await new Promise(resolve => {
        setTimeout(() => {
          resolve(`[${selectedLanguage.toUpperCase()}] ${text}`)
        }, 600)
      })
      setTranslatedInstructions(translated)
    } catch (err) {
      console.error('Translation failed')
      setTranslatedInstructions(text)
    } finally {
      setTranslating(false)
    }
  }

  const generateAndPlayAudio = async () => {
    setGeneratingAudio(true)
    try {
      const url = await generateAudio(translatedInstructions, selectedLanguage)
      setAudioUrl(url)
    } catch (err) {
      console.error('Audio generation failed')
    } finally {
      setGeneratingAudio(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/prescription-view')}
            className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2 mb-4"
          >
            ← Back to Medicines
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2 text-balance">
            Instructions in Your Language
          </h1>
          <p className="text-lg text-gray-600">
            Read, listen, and download your medicine instructions
          </p>
        </div>

        {loading ? (
          <PrescriptionSkeleton />
        ) : (
          <div className="space-y-8">
            {/* Instructions Card */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Take Your Medicines</h2>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <p className="text-lg leading-relaxed text-gray-800 whitespace-pre-line font-medium">
                  {translating ? (
                    <span className="text-gray-500 italic">Translating...</span>
                  ) : (
                    translatedInstructions || instructions
                  )}
                </p>
              </div>

              {/* Audio Player */}
              {audioUrl ? (
                <AudioPlayer audioUrl={audioUrl} text={translatedInstructions} language={selectedLanguage} />
              ) : (
                <button
                  onClick={generateAndPlayAudio}
                  disabled={generatingAudio}
                  className="btn-primary w-full"
                >
                  {generatingAudio ? 'Generating Audio...' : 'Play Audio Instructions'}
                </button>
              )}
            </div>

            {/* Summary */}
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Summary</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {medicines.map((med) => (
                  <div key={med.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="font-bold text-gray-900">{med.name}</p>
                    <p className="text-sm text-gray-600 mt-1">{med.strength}</p>
                    <p className="text-sm font-semibold text-green-700 mt-2">
                      For {med.duration}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Final Action */}
            <button
              onClick={() => navigate('/')}
              className="btn-secondary w-full"
            >
              Upload Another Prescription
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
