import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import axios from "axios";

import createUploadRoutes from "./routes/upload.routes.js";
import summaryRoutes from "./routes/summary.routes.js";
import warningsRoutes from "./routes/warnings.routes.js";
import medicineInfoRoutes from "./routes/medicineInfo.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

// Upload folder
const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Expose uploads folder to frontend
app.use("/uploads", express.static(UPLOAD_DIR));

// Multer config (shared across routes)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) =>
    cb(null, `presc_${Date.now()}${path.extname(file.originalname)}`),
});
export const upload = multer({ storage });

// Health check
app.get("/health", (req, res) => res.json({ status: "Backend running" }));

// Register routes
app.use("/api", createUploadRoutes(upload));
app.use("/api", summaryRoutes);
app.use("/api", warningsRoutes);
app.use("/api", medicineInfoRoutes);

// Server
const SERVER_URL = process.env.SERVER_URL;
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Prevent Render/Netlify/Vercel timeout
  setInterval(async () => {
    try {
      console.log("Pinging server...");
      await axios.get(`${SERVER_URL}/health`);
    } catch (err) {
      console.error("Ping error:", err.message);
    }
  }, 180000); // 3 min
});
