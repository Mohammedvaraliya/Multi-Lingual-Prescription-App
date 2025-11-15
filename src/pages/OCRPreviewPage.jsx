import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePrescription } from "../context/PrescriptionContext";
import { generateSummary, getWarnings } from "../utils/api";
import { WarningIcon } from "../components/Icons";
import { TextareaSkeleton } from "../components/LoadingSkeletons";

export default function OCRPreviewPage() {
  const navigate = useNavigate();
  const { setLoading: setContextLoading } = usePrescription(); // Renamed to avoid conflict
  const [loading, setLoading] = useState(false); // Fixed variable name
  const [warnings, setWarnings] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);

  // Initialize form data when component mounts
  useEffect(() => {
    // Try to get data from sessionStorage
    const storedData = sessionStorage.getItem("prescriptionData");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setFormData(JSON.parse(JSON.stringify(parsedData))); // Deep copy for form
      generateWarnings(parsedData);
    }
  }, []);

  const generateWarnings = async (data) => {
    try {
      const warningsList = await getWarnings(data);
      setWarnings(warningsList);
    } catch (err) {
      console.error("Failed to get warnings:", err);
      // Convert error message to warning object format
      setWarnings([{ message: err.message }]);
    }
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Store updated data in sessionStorage
      sessionStorage.setItem("prescriptionData", JSON.stringify(formData));

      // Generate new warnings based on updated data
      const warningsList = await getWarnings(formData);
      setWarnings(warningsList);

      setEditMode(false);
    } catch (err) {
      // Convert error message to warning object format
      setWarnings([{ message: err.message }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original data from sessionStorage
    const storedData = sessionStorage.getItem("prescriptionData");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setFormData(JSON.parse(JSON.stringify(parsedData)));
    }
    setEditMode(false);
  };

  const handleChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleExaminationChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      doctorsNotes: {
        ...prev.doctorsNotes,
        onExamination: {
          ...prev.doctorsNotes.onExamination,
          [field]: value,
        },
      },
    }));
  };

  const handleMedicineChange = (index, field, value) => {
    setFormData((prev) => {
      const newTreatment = [...prev.treatmentAndAdvice];
      newTreatment[index] = {
        ...newTreatment[index],
        [field]: value,
      };
      return {
        ...prev,
        treatmentAndAdvice: newTreatment,
      };
    });
  };

  const handleContinue = async () => {
    setLoading(true);
    try {
      // Generate summary for the prescription data
      const summary = await generateSummary(formData);
      setSummaryData(summary);

      // Store summary data in sessionStorage
      sessionStorage.setItem("summaryData", JSON.stringify(summary));

      // Store updated prescription data
      sessionStorage.setItem("prescriptionData", JSON.stringify(formData));

      navigate("/prescription-view");
    } catch (err) {
      // Convert error message to warning object format
      setWarnings([{ message: err.message }]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <TextareaSkeleton />
        </div>
      </div>
    );
  }

  if (!formData) {
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
            onClick={() => navigate("/")}
            className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2 mb-4"
          >
            ← Back to Upload
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2 text-balance">
            Prescription Details
          </h1>
          <p className="text-lg text-gray-600">
            Review and edit your prescription information
          </p>
        </div>

        {/* Warning Section */}
        {warnings.length > 0 && (
          <div className="mb-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r">
            <div className="flex gap-3">
              <WarningIcon />
              <div>
                <p className="font-semibold text-yellow-900">
                  Please Review Carefully
                </p>
                <ul className="list-disc list-inside text-sm text-yellow-800 mt-2">
                  {warnings.map((w, i) => (
                    <li key={i}>{w.message || w}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Prescription Form */}
        <div className="card mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Prescription Information
            </h2>
            {!editMode ? (
              <button onClick={handleEdit} className="btn-secondary">
                Edit Details
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleCancel} className="btn-secondary">
                  Cancel
                </button>
                <button onClick={handleSave} className="btn-primary">
                  Save Changes
                </button>
              </div>
            )}
          </div>

          {/* Patient Details Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
              Patient Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["name", "age", "date"].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={formData.patientDetails[field]}
                      onChange={(e) =>
                        handleChange("patientDetails", field, e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="p-2 bg-gray-50 rounded-md border border-gray-200">
                      {formData.patientDetails[field]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Doctor's Notes Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
              Doctor's Notes
            </h3>
            <div className="space-y-4">
              {["complaint", "impression", "explanation"].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  {editMode ? (
                    <textarea
                      value={formData.doctorsNotes[field]}
                      onChange={(e) =>
                        handleChange("doctorsNotes", field, e.target.value)
                      }
                      rows={2}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="p-2 bg-gray-50 rounded-md border border-gray-200 min-h-[40px]">
                      {formData.doctorsNotes[field] || (
                        <span className="text-gray-400">Not specified</span>
                      )}
                    </div>
                  )}
                </div>
              ))}

              <div>
                <h4 className="text-md font-medium text-gray-700 mb-2">
                  On Examination
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {["bp", "pr", "temp", "spo2"].map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.toUpperCase()}
                      </label>
                      {editMode ? (
                        <input
                          type="text"
                          value={formData.doctorsNotes.onExamination[field]}
                          onChange={(e) =>
                            handleExaminationChange(field, e.target.value)
                          }
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <div className="p-2 bg-gray-50 rounded-md border border-gray-200">
                          {formData.doctorsNotes.onExamination[field] || (
                            <span className="text-gray-400">Not specified</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Treatment and Advice Section */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
              Treatment and Advice
            </h3>
            <div className="space-y-6">
              {formData.treatmentAndAdvice.map((medicine, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 bg-white"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-900">
                      Medication #{index + 1}
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {["item", "route", "dosage", "timing"].map((field) => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {field.charAt(0).toUpperCase() + field.slice(1)}
                        </label>
                        {editMode ? (
                          field === "route" ? (
                            <select
                              value={medicine[field]}
                              onChange={(e) =>
                                handleMedicineChange(
                                  index,
                                  field,
                                  e.target.value
                                )
                              }
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select route</option>
                              <option value="oral">Oral</option>
                              <option value="topical">Topical</option>
                              <option value="iv">IV</option>
                              <option value="injection">Injection</option>
                              <option value="inhalation">Inhalation</option>
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={medicine[field]}
                              onChange={(e) =>
                                handleMedicineChange(
                                  index,
                                  field,
                                  e.target.value
                                )
                              }
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                          )
                        ) : (
                          <div className="p-2 bg-gray-50 rounded-md border border-gray-200">
                            {medicine[field] || (
                              <span className="text-gray-400">
                                Not specified
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    {editMode ? (
                      <textarea
                        value={medicine.notes}
                        onChange={(e) =>
                          handleMedicineChange(index, "notes", e.target.value)
                        }
                        rows={2}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded-md border border-gray-200 min-h-[40px]">
                        {medicine.notes || (
                          <span className="text-gray-400">No notes</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/")}
            className="btn-secondary flex-1"
          >
            Back to Upload
          </button>
          <button
            onClick={handleContinue}
            className="btn-primary flex-1"
            disabled={loading}
          >
            {loading
              ? "Generating Summary..."
              : "Continue to Prescription View"}
          </button>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="font-semibold text-blue-900 mb-2">
            Tips for best results:
          </p>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>- Make sure all medicine names are clearly spelled</li>
            <li>- Check dosage numbers (morning/noon/night)</li>
            <li>- Verify duration and food instructions</li>
            <li>- Remove any watermarks or extra text</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
