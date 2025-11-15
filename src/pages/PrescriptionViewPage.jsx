import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SunIcon, MoonIcon, PlateIcon } from '../components/Icons'
import { PrescriptionSkeleton } from '../components/LoadingSkeletons'

export default function PrescriptionViewPage() {
  const navigate = useNavigate()
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [warnings, setWarnings] = useState([])

  useEffect(() => {
    // Get parsed prescription from sessionStorage
    const stored = sessionStorage.getItem('parsedPrescription')
    if (stored) {
      try {
        const data = JSON.parse(stored)
        setMedicines(data.medicines || [])
        setWarnings(data.warnings || [])
        setLoading(false)
      } catch (err) {
        console.error('Failed to load prescription data')
        setLoading(false)
      }
    }
  }, [])

  const renderDosageIcons = (dosage) => {
    const items = []
    if (dosage.morning) items.push(<SunIcon key="morning" />)
    if (dosage.afternoon) items.push(<SunIcon key="afternoon" />)
    if (dosage.night) items.push(<MoonIcon key="night" />)
    return items
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/ocr-preview')}
            className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2 mb-4"
          >
            ← Back to OCR Preview
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2 text-balance">
            Your Medicines
          </h1>
          <p className="text-lg text-gray-600">
            Here are your medicines with clear instructions
          </p>
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="mb-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r">
            <p className="font-semibold text-yellow-900 mb-2">Important Notes:</p>
            <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
              {warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Medicine Cards */}
        {loading ? (
          <PrescriptionSkeleton />
        ) : (
          <div className="space-y-6">
            {medicines.map((medicine) => (
              <div key={medicine.id} className="card hover:shadow-md transition-shadow">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left: Medicine Details */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      {medicine.name}
                    </h3>
                    <p className="text-lg text-gray-600 mb-4 font-semibold">
                      {medicine.strength}
                    </p>

                    <div className="space-y-3">
                      {medicine.dosage.morning > 0 && (
                        <div className="flex items-center gap-3">
                          <SunIcon />
                          <span className="text-lg font-semibold text-gray-900">
                            Morning: {medicine.dosage.morning} tablet
                          </span>
                        </div>
                      )}

                      {medicine.dosage.afternoon > 0 && (
                        <div className="flex items-center gap-3">
                          <SunIcon />
                          <span className="text-lg font-semibold text-gray-900">
                            Afternoon: {medicine.dosage.afternoon} tablet
                          </span>
                        </div>
                      )}

                      {medicine.dosage.night > 0 && (
                        <div className="flex items-center gap-3">
                          <MoonIcon />
                          <span className="text-lg font-semibold text-gray-900">
                            Night: {medicine.dosage.night} tablet
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Duration & Food */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-2">Duration</p>
                      <p className="text-2xl font-bold text-green-600 mb-6">
                        {medicine.duration}
                      </p>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                      <div className="flex items-center gap-2 mb-2">
                        <PlateIcon />
                        <p className="font-semibold text-gray-900">Food Instructions</p>
                      </div>
                      <p className="text-lg text-gray-700 font-medium">
                        Take {medicine.food}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Icon Timeline */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm font-semibold text-gray-600 mb-3">Timeline:</p>
                  <div className="flex gap-3">
                    {renderDosageIcons(medicine.dosage).map((icon, i) => (
                      <div key={i} className="w-14 h-14 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
                        {icon}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Continue Button */}
        <button
          onClick={() => navigate('/instructions')}
          className="btn-primary w-full mt-8 text-lg"
        >
          Get Audio Instructions in Your Language
        </button>
      </div>
    </div>
  )
}
