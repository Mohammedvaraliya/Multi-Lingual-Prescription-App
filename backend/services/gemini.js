import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Remove code fences
function cleanJSON(text) {
  return text
    .replace(/```json/i, "")
    .replace(/```/g, "")
    .trim();
}

function cleanSummary(text) {
  return text
    .replace(/\*\*/g, "") // remove bold markers
    .replace(/\*/g, "") // remove bullets
    .replace(/#/g, "") // remove markdown headings
    .replace(/_/g, "") // remove italic markers
    .replace(/\n{2,}/g, "\n") // collapse multiple newlines
    .replace(/\s{2,}/g, " ") // collapse extra spaces
    .trim();
}

// =======================================================
// 1️⃣ Extract full prescription JSON
// =======================================================
export async function extractPrescription(imagePath) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const imageData = fs.readFileSync(imagePath);

  const prompt = `
You are a medical prescription extraction system.

Extract ALL fields and return ONLY valid JSON:

{
  "patientDetails": { "name": "", "age": "", "date": "" },
  "doctorsNotes": {
    "complaint": "",
    "impression": "",
    "explanation": "",
    "onExamination": { "bp": "", "pr": "", "temp": "", "spo2": "" }
  },
  "treatmentAndAdvice": [
    { "item": "", "route": "", "dosage": "", "timing": "", "notes": "" }
  ],
  "summary": ""
}

Rules:
- summary = short explanation of full prescription
- No markdown
- No backticks
`;

  const result = await model.generateContent([
    { text: prompt },
    {
      inlineData: {
        data: imageData.toString("base64"),
        mimeType: "image/jpeg",
      },
    },
  ]);

  const raw = result.response.text();
  const clean = cleanJSON(raw);

  return JSON.parse(clean);
}

// =======================================================
// 2️⃣ Generate English summary from user-edited JSON
// =======================================================
export async function generateSummaryFromJSON(finalJSON) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
Create a clear, patient-friendly medical summary from this JSON:
${JSON.stringify(finalJSON, null, 2)}

STRICT RULES:
- DO NOT use markdown formatting.
- DO NOT use **bold**.
- DO NOT use *bullets.
- DO NOT use lists.
- NO special characters like *, _, #.
- NO markdown headings.
- Output plain text only.
- Short paragraphs only.
`;

  const result = await model.generateContent(prompt);

  // Raw Gemini output
  let text = result.response.text();

  // Clean any leftover formatting
  text = cleanSummary(text);

  return text;
}
