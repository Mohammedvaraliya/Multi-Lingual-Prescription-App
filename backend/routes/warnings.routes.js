import express from "express";
import warningsService from "../services/warnings.js";

const router = express.Router();

// POST /api/warnings
// Body: final prescription JSON (the edited JSON from frontend)
router.post("/warnings", async (req, res) => {
  try {
    const prescription = req.body;
    const warnings = warningsService.analyzePrescription(prescription);

    res.json({
      warnings,
      count: warnings.length,
    });
  } catch (err) {
    console.error("Warnings route error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
