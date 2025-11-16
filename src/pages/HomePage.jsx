import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguageContext } from "../context/LanguageContext";
import { usePrescription } from "../context/PrescriptionContext";
import { useUpload } from "../hooks/useUpload";
import { UploadIcon } from "../components/Icons";
import { LanguageSelector } from "../components/LanguageSelector";
import { UploadSkeleton } from "../components/LoadingSkeletons";
import { uploadPrescription } from "../utils/api";
import { useTranslate } from "../hooks/useTranslate";

export default function HomePage() {
  const navigate = useNavigate();
  const { selectedLanguage } = useLanguageContext();
  const { setLoading } = usePrescription();
  const { preview, uploading, error, handleFileSelect } = useUpload();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);

  const { t } = useTranslate();

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

      const formData = new FormData();
      formData.append("file", file);
      formData.append("targetedValue", selectedLanguage);

      const result = await uploadPrescription(formData);

      sessionStorage.setItem("prescriptionData", JSON.stringify(result));

      navigate("/ocr-preview");
    } catch (err) {
      console.error("Upload failed:", err);
      alert(`${t("home.uploadFailed")}: ${err.message || t("home.tryAgain")}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            {t("home.prescriptionReader")}
          </h1>
          <p className="text-xl text-gray-600">{t("home.subtitle")}</p>
        </div>

        {/* Language Selector */}
        <div className="mb-8">
          <LanguageSelector />
        </div>

        {/* Upload Card */}
        <div className="card">
          {uploading ? (
            <UploadSkeleton />
          ) : (
            <>
              {/* Drag and drop */}
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
                    {t("home.dropHere")}
                  </h2>
                  <p className="text-lg text-gray-600 mb-6">
                    {t("home.orClick")}
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
                    {t("home.selectImage")}
                  </label>
                </div>
              </div>

              {/* Preview */}
              {preview && (
                <div className="mt-8">
                  <p className="text-sm font-semibold text-gray-600 mb-3">
                    {t("home.preview")}
                  </p>
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full max-h-96 object-cover rounded-lg border-2 border-gray-200"
                  />
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              )}

              {/* Submit */}
              {preview && (
                <button
                  onClick={handleSubmit}
                  disabled={uploading}
                  className="btn-primary w-full mt-8"
                >
                  {uploading ? t("home.processing") : t("home.continue")}
                </button>
              )}
            </>
          )}
        </div>

        {/* Steps Info */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">1</div>
            <p className="text-gray-700 font-medium">{t("home.stepUpload")}</p>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">2</div>
            <p className="text-gray-700 font-medium">{t("home.stepVerify")}</p>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">3</div>
            <p className="text-gray-700 font-medium">{t("home.stepGet")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
