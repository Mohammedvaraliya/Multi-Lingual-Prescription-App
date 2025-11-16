import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SunIcon, MoonIcon, PlateIcon, InfoIcon } from "../components/Icons";
import { PrescriptionSkeleton } from "../components/LoadingSkeletons";
import { getMedicineInfo } from "../utils/api";

export default function PrescriptionViewPage() {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [warnings, setWarnings] = useState([]);
  const [prescriptionData, setPrescriptionData] = useState(null);
  const [medicineDetails, setMedicineDetails] = useState({});
  const [expandedMedicine, setExpandedMedicine] = useState(null);

  useEffect(() => {
    // Get prescription data from sessionStorage
    const stored = sessionStorage.getItem("prescriptionData");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setPrescriptionData(data);

        // Transform treatmentAndAdvice to medicines format
        const transformedMedicines = data.treatmentAndAdvice.map(
          (item, index) => {
            // Parse dosage if it's in the format "1-0-1"
            let dosage = { morning: 0, afternoon: 0, night: 0 };
            if (item.dosage && item.dosage.includes("-")) {
              const parts = item.dosage.split("-");
              dosage.morning = parseInt(parts[0]) || 0;
              dosage.afternoon = parseInt(parts[1]) || 0;
              dosage.night = parseInt(parts[2]) || 0;
            } else if (item.dosage) {
              // If it's a single number, assume it's for morning
              dosage.morning = parseInt(item.dosage) || 0;
            }

            // Extract duration from timing
            let duration = item.timing || "";
            if (item.timing && item.timing.includes("for")) {
              const match = item.timing.match(/for (\d+ days?)/i);
              if (match) {
                duration = match[1];
              }
            }

            // Determine food instructions
            let food = "with water";
            if (item.timing) {
              if (item.timing.includes("before meals")) {
                food = "before meals";
              } else if (item.timing.includes("after meals")) {
                food = "after meals";
              }
            }

            return {
              id: index + 1,
              name: item.item,
              strength:
                item.item.match(/\d+mg/)?.[0] ||
                item.item.match(/\d+%/)?.[0] ||
                "",
              dosage,
              duration,
              food,
              route: item.route || "",
              notes: item.notes || "",
              timing: item.timing || "",
            };
          }
        );

        setMedicines(transformedMedicines);
        setWarnings(data.warnings || []);

        // Fetch medicine details
        fetchMedicineDetails(data);

        setLoading(false);
      } catch (err) {
        console.error("Failed to load prescription data", err);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchMedicineDetails = async (data) => {
    try {
      const details = await getMedicineInfo(data);
      // Convert array to object for easier lookup
      const detailsMap = {};
      details.medicines.forEach((med) => {
        detailsMap[med.item] = med.details;
      });
      setMedicineDetails(detailsMap);
    } catch (err) {
      console.error("Failed to fetch medicine details", err);
    }
  };

  const toggleMedicineDetails = (medicineId) => {
    setExpandedMedicine(expandedMedicine === medicineId ? null : medicineId);
  };

  const renderDosageIcons = (dosage) => {
    const items = [];
    if (dosage.morning > 0) items.push(<SunIcon key="morning" />);
    if (dosage.afternoon > 0) items.push(<SunIcon key="afternoon" />);
    if (dosage.night > 0) items.push(<MoonIcon key="night" />);
    return items;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <PrescriptionSkeleton />
        </div>
      </div>
    );
  }

  if (!prescriptionData || medicines.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            No prescription data available
          </h1>
          <button onClick={() => navigate("/")} className="btn-primary">
            Go Back to Upload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/ocr-preview")}
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

        {/* Patient Information */}
        <div className="card mb-8">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Patient Details
              </h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {prescriptionData.patientDetails.name}
                </p>
                <p>
                  <span className="font-medium">Age:</span>{" "}
                  {prescriptionData.patientDetails.age}
                </p>
                <p>
                  <span className="font-medium">Date:</span>{" "}
                  {prescriptionData.patientDetails.date}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Doctor's Notes
              </h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Complaint:</span>{" "}
                  {prescriptionData.doctorsNotes.complaint || "None recorded"}
                </p>
                <p>
                  <span className="font-medium">Impression:</span>{" "}
                  {prescriptionData.doctorsNotes.impression || "None recorded"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="mb-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r">
            <p className="font-semibold text-yellow-900 mb-2">
              Important Notes:
            </p>
            <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
              {warnings.map((w, i) => (
                <li key={i}>{w.message || w}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Medicine Cards */}
        <div className="space-y-6">
          {medicines.map((medicine) => (
            <div
              key={medicine.id}
              className="card hover:shadow-md transition-shadow"
            >
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left: Medicine Details */}
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">
                        {medicine.name}
                      </h3>
                      <p className="text-lg text-gray-600 mb-4 font-semibold">
                        {medicine.strength}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleMedicineDetails(medicine.id)}
                      className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors"
                      aria-label="More information"
                    >
                      <InfoIcon />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {medicine.dosage.morning > 0 && (
                      <div className="flex items-center gap-3">
                        <SunIcon />
                        <span className="text-lg font-semibold text-gray-900">
                          Morning: {medicine.dosage.morning}{" "}
                          {medicine.route === "iv" ? "units" : "tablet"}
                        </span>
                      </div>
                    )}

                    {medicine.dosage.afternoon > 0 && (
                      <div className="flex items-center gap-3">
                        <SunIcon />
                        <span className="text-lg font-semibold text-gray-900">
                          Afternoon: {medicine.dosage.afternoon}{" "}
                          {medicine.route === "iv" ? "units" : "tablet"}
                        </span>
                      </div>
                    )}

                    {medicine.dosage.night > 0 && (
                      <div className="flex items-center gap-3">
                        <MoonIcon />
                        <span className="text-lg font-semibold text-gray-900">
                          Night: {medicine.dosage.night}{" "}
                          {medicine.route === "iv" ? "units" : "tablet"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Duration & Food */}
                <div className="flex flex-col justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-2">
                      Duration
                    </p>
                    <p className="text-2xl font-bold text-green-600 mb-6">
                      {medicine.duration}
                    </p>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <PlateIcon />
                      <p className="font-semibold text-gray-900">
                        Food Instructions
                      </p>
                    </div>
                    <p className="text-lg text-gray-700 font-medium">
                      Take {medicine.food}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">
                      Route
                    </p>
                    <p className="text-gray-800">
                      {medicine.route || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">
                      Timing
                    </p>
                    <p className="text-gray-800">
                      {medicine.timing || "Not specified"}
                    </p>
                  </div>
                </div>
                {medicine.notes && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-gray-600 mb-1">
                      Notes
                    </p>
                    <p className="text-gray-800">{medicine.notes}</p>
                  </div>
                )}
              </div>

              {/* Medicine Details Section */}
              {expandedMedicine === medicine.id && (
                <div className="mt-6 pt-6 border-t border-gray-200 bg-blue-50 rounded-lg p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-4">
                    About {medicine.name}
                  </h4>

                  {medicineDetails[medicine.name] ? (
                    <div className="space-y-4">
                      {medicineDetails[medicine.name].purpose && (
                        <div>
                          <p className="font-semibold text-gray-800 mb-1">
                            Purpose
                          </p>
                          <p className="text-gray-700">
                            {medicineDetails[medicine.name].purpose}
                          </p>
                        </div>
                      )}

                      {medicineDetails[medicine.name].mechanism && (
                        <div>
                          <p className="font-semibold text-gray-800 mb-1">
                            How it works
                          </p>
                          <p className="text-gray-700">
                            {medicineDetails[medicine.name].mechanism}
                          </p>
                        </div>
                      )}

                      {medicineDetails[medicine.name].whyPrescribed && (
                        <div>
                          <p className="font-semibold text-gray-800 mb-1">
                            Why prescribed
                          </p>
                          <p className="text-gray-700">
                            {medicineDetails[medicine.name].whyPrescribed}
                          </p>
                        </div>
                      )}

                      {medicineDetails[medicine.name].commonSideEffects && (
                        <div>
                          <p className="font-semibold text-gray-800 mb-1">
                            Common side effects
                          </p>
                          <p className="text-gray-700">
                            {medicineDetails[medicine.name].commonSideEffects}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-600">
                        No additional information available
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Icon Timeline */}
              {(medicine.dosage.morning > 0 ||
                medicine.dosage.afternoon > 0 ||
                medicine.dosage.night > 0) && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm font-semibold text-gray-600 mb-3">
                    Timeline:
                  </p>
                  <div className="flex gap-3">
                    {renderDosageIcons(medicine.dosage).map((icon, i) => (
                      <div
                        key={i}
                        className="w-14 h-14 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200"
                      >
                        {icon}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Continue Button */}
        <button
          onClick={() => navigate("/instructions")}
          className="btn-primary w-full mt-8 text-lg"
        >
          Get Audio Instructions in Your Language
        </button>
      </div>
    </div>
  );
}
