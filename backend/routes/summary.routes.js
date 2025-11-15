import express from "express";
import path from "path";
import fs from "fs";

import { generateSummaryFromJSON } from "../services/gemini.js";
import { translateLingo } from "../services/lingo.js";
import { generateAudio } from "../services/tts.js";

const router = express.Router();

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";

// SUMMARY → Translate → Audio
router.post("/generate-summary", async (req, res) => {
  try {
    const targetLocale = req.body.targetLocale || "hi";
    const data = req.body;

    // 1. English Summary
    const summaryEnglish = await generateSummaryFromJSON(data);

    // 2. Translation
    const summaryTranslated = await translateLingo(
      summaryEnglish,
      targetLocale
    );

    if (!summaryTranslated) throw new Error("Translation failed");

    // 3. Audio (TTS)
    const audioBuffer = await generateAudio(summaryTranslated, targetLocale);
    const audioBase64 = audioBuffer.toString("base64");

    // Save audio file to uploads/
    const fileName = `audio_${Date.now()}.mp3`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    fs.writeFileSync(filePath, audioBuffer);

    res.json({
      summaryEnglish,
      summaryTranslated,
      audioBase64,
      audioUrl: `/uploads/${fileName}`,
    });
  } catch (err) {
    console.error("❌ Summary Error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
