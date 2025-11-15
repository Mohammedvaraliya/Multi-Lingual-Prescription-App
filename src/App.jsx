import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import { PrescriptionProvider } from "./context/PrescriptionContext";
import HomePage from "./pages/HomePage";
import OCRPreviewPage from "./pages/OCRPreviewPage";
import PrescriptionViewPage from "./pages/PrescriptionViewPage";
import TranslatedInstructionsPage from "./pages/TranslatedInstructionsPage";

function App() {
  return (
    <Router>
      <LanguageProvider>
        <PrescriptionProvider>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/ocr-preview" element={<OCRPreviewPage />} />
              <Route
                path="/prescription-view"
                element={<PrescriptionViewPage />}
              />
              <Route
                path="/instructions"
                element={<TranslatedInstructionsPage />}
              />
            </Routes>
          </div>
        </PrescriptionProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;
