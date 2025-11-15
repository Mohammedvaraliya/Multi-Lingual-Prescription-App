import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import axios from "axios";
import { extractPrescription } from "./services/gemini.js";
import { translateLingo } from "./services/lingo.js";
import { generateAudio } from "./services/tts.js";

const app = express();
app.use(cors());
app.use(express.json());

// Upload Folder
const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) =>
    cb(null, `presc_${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage });

// Health Check
app.get("/health", (req, res) => res.json({ status: "Backend running" }));

// =======================================================
// 1️⃣ UPLOAD ENDPOINT → Extract JSON (NO summary yet)
// =======================================================
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const data = await extractPrescription(req.file.path);

    // Canonical transformation
    const canonical = data.treatmentAndAdvice.map((item) => {
      let line = `${item.item}`;

      if (item.route) line += ` via ${item.route}`;
      if (item.dosage) line += `, dosage: ${item.dosage}`;
      if (item.timing) line += `, timing: ${item.timing}`;
      if (item.notes) line += ` (${item.notes})`;

      return line;
    });

    res.json({
      patientDetails: data.patientDetails,
      doctorsNotes: data.doctorsNotes,
      treatmentAndAdvice: data.treatmentAndAdvice,
      canonical,
    });
  } catch (err) {
    console.error("❌ Upload Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// =======================================================
// 2️⃣ SUMMARY ENDPOINT → Gemini Summary + Lingo Translate
// =======================================================
app.post("/api/generate-summary", async (req, res) => {
  try {
    const targetLocale = req.body.targetLocale || "hi";
    const data = req.body;

    // 1. English Summary (Gemini)
    const { generateSummaryFromJSON } = await import("./services/gemini.js");
    const summaryEnglish = await generateSummaryFromJSON(data);

    // 2. Translated Summary (Lingo)
    const summaryTranslated = await translateLingo(
      summaryEnglish,
      targetLocale
    );
    if (!summaryTranslated) {
      throw new Error("Translation failed");
    }

    // 3. FREE TTS using gTTS
    let audioBase64 = null; // <-- declare here so it exists outside the if

    const audioBuffer = await generateAudio(summaryTranslated, targetLocale);
    audioBase64 = audioBuffer.toString("base64");

    const fileName = `audio_${Date.now()}.mp3`;
    const savePath = path.join(UPLOAD_DIR, fileName);

    fs.writeFileSync(savePath, audioBuffer);

    return res.json({
      summaryEnglish,
      summaryTranslated,
      audioBase64,
    });
  } catch (err) {
    console.error("❌ Summary Error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// Start Server

const SERVER_URL = process.env.SERVER_URL;
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Self-ping every 3 minutes (180,000 ms)
  setInterval(async () => {
    try {
      console.log("Pinging server to keep it alive...");
      await axios.get(`${SERVER_URL}/`);
      console.log("Server pinged successfully.");
    } catch (err) {
      console.error("Error pinging server:", err.message);
    }
  }, 180000); // 3 minutes
});
