import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { AudioPlayer } from "../components/AudioPlayer";
import { PrescriptionSkeleton } from "../components/LoadingSkeletons";

// Helper function to convert base64 to blob URL
const base64ToBlobUrl = (base64Data, mimeType = "audio/mp3") => {
  try {
    // Remove data URL prefix if present
    const base64 = base64Data.includes(",")
      ? base64Data.split(",")[1]
      : base64Data;

    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error converting base64 to blob:", error);
    return null;
  }
};

export default function TranslatedInstructionsPage() {
  const navigate = useNavigate();
  const { selectedLanguage } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [audioUrl, setAudioUrl] = useState("");
  const [summaryData, setSummaryData] = useState(null);

  useEffect(() => {
    // Get summary data from sessionStorage
    const storedSummary = sessionStorage.getItem("summaryData");
    if (storedSummary) {
      try {
        const data = JSON.parse(storedSummary);
        setSummaryData(data);

        // Convert base64 audio to blob URL
        if (data.audioBase64) {
          const url = base64ToBlobUrl(data.audioBase64);
          setAudioUrl(url);
        }

        setLoading(false);
      } catch (err) {
        console.error("Failed to load summary data", err);
        setLoading(false);
      }
    }
  }, [selectedLanguage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <PrescriptionSkeleton />
        </div>
      </div>
    );
  }

  if (!summaryData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            No summary data available
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
            onClick={() => navigate("/prescription-view")}
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

        <div className="space-y-8">
          {/* Instructions Card */}
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              How to Take Your Medicines
            </h2>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <p className="text-lg leading-relaxed text-gray-800 whitespace-pre-line font-medium">
                {summaryData.summaryTranslated || summaryData.summaryEnglish}
              </p>
            </div>

            {/* Audio Player */}
            {audioUrl ? (
              <AudioPlayer
                audioUrl={audioUrl}
                text={summaryData.summaryTranslated}
                language={selectedLanguage}
              />
            ) : (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">Audio not available</p>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Quick Summary
            </h3>
            <div className="bg-blue-50 rounded-lg p-6">
              <p className="text-gray-800">{summaryData.summaryEnglish}</p>
            </div>
          </div>

          {/* Final Action */}
          <button
            onClick={() => navigate("/")}
            className="btn-secondary w-full"
          >
            Upload Another Prescription
          </button>
        </div>
      </div>
    </div>
  );
}
