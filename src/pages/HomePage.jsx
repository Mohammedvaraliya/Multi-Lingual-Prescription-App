import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { usePrescription } from "../context/PrescriptionContext";
import { useUpload } from "../hooks/useUpload";
import { UploadIcon } from "../components/Icons";
import { LanguageSelector } from "../components/LanguageSelector";
import { UploadSkeleton } from "../components/LoadingSkeletons";
import { uploadPrescription } from "../utils/api";

export default function HomePage() {
  const navigate = useNavigate();
  const { selectedLanguage } = useLanguage();
  const { setLoading } = usePrescription(); // Only using setLoading from context
  const { preview, uploading, error, handleFileSelect } = useUpload();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer?.files?.[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
      setFile(droppedFile);
    }
  };

  const handleInputChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
      setFile(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    try {
      setLoading(true);

      // Create FormData to send file and language in the request body
      const formData = new FormData();
      formData.append("file", file);
      formData.append("targetedValue", selectedLanguage);

      const result = await uploadPrescription(formData);

      // Store in sessionStorage for other pages
      sessionStorage.setItem("prescriptionData", JSON.stringify(result));

      navigate("/ocr-preview");
    } catch (err) {
      console.error("Upload failed:", err);
      // Display error to user
      alert(`Upload failed: ${err.message || "Please try again"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 text-balance">
            Prescription Reader
          </h1>
          <p className="text-xl text-gray-600 text-balance">
            Upload your prescription and get it explained in your language
          </p>
        </div>

        {/* Language Selector */}
        <div className="mb-8">
          <LanguageSelector />
        </div>

        {/* Upload Section */}
        <div className="card">
          {uploading ? (
            <UploadSkeleton />
          ) : (
            <>
              {/* Drag & Drop Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-4 border-dashed rounded-2xl p-12 text-center transition-colors ${
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <div className="flex flex-col items-center">
                  <UploadIcon />
                  <h2 className="text-2xl font-bold text-gray-900 mt-4 mb-2">
                    Drop prescription here
                  </h2>
                  <p className="text-lg text-gray-600 mb-6">
                    or click to select image
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="hidden"
                    id="file-input"
                  />
                  <label
                    htmlFor="file-input"
                    className="btn-primary cursor-pointer"
                  >
                    Select Image
                  </label>
                </div>
              </div>

              {/* Preview */}
              {preview && (
                <div className="mt-8">
                  <p className="text-sm font-semibold text-gray-600 mb-3">
                    Preview:
                  </p>
                  <img
                    src={preview || "/placeholder.svg"}
                    alt="Prescription preview"
                    className="w-full max-h-96 object-cover rounded-lg border-2 border-gray-200"
                  />
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              {preview && (
                <button
                  onClick={handleSubmit}
                  disabled={uploading}
                  className="btn-primary w-full mt-8"
                >
                  {uploading ? "Processing..." : "Continue to OCR Check"}
                </button>
              )}
            </>
          )}
        </div>

        {/* Information */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">1</div>
            <p className="text-gray-700 font-medium">Upload prescription</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">2</div>
            <p className="text-gray-700 font-medium">Verify & edit text</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">3</div>
            <p className="text-gray-700 font-medium">Get in your language</p>
          </div>
        </div>
      </div>
    </div>
  );
}
