import express from "express";
import fs from "fs";
import path from "path";
import { upload } from "../index.js";
import { extractPrescription } from "../services/gemini.js";

const router = express.Router();

// UPLOAD → Extract prescription
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const data = await extractPrescription(req.file.path);

    // Canonical formatting
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

export default router;
