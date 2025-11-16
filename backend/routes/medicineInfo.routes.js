import express from "express";

const router = express.Router();

router.post("/medicine-info", async (req, res) => {
  try {
    const prescription = req.body;

    const meds = prescription.treatmentAndAdvice || [];

    const output = meds.map((med) => ({
      item: med.item,
      details: med.details || {
        purpose: "",
        mechanism: "",
        commonSideEffects: "",
        whyPrescribed: "",
      },
    }));

    res.json({ medicines: output });
  } catch (err) {
    console.error("Medicine Info Error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
