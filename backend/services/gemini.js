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
You are a highly strict and reliable medical prescription extraction system.

Your task has TWO phases:

====================================================
PHASE 1 — RAW TEXT EXTRACTION
====================================================
- Read the prescription image.
- Extract ALL visible text exactly as it appears.
- DO NOT clean, fix, correct, interpret, or alter spelling.
- DO NOT expand abbreviations.
- If text is unclear, include it exactly as-is.
- Include ALL text: patient info, diagnoses, medicines, timings, dosage, advice, notes, signatures — everything.

====================================================
PHASE 2 — STRUCTURED JSON EXTRACTION
====================================================
Using ONLY the rawExtractedText from PHASE 1, extract structured data.

CRITICAL RULES:
- DO NOT hallucinate or invent ANY medicine, dosage, timing, route, or diagnosis.
- A medicine must appear EXACTLY in rawExtractedText to be included.
- DO NOT normalize or change the spelling of items.
- If unsure about any field, set it to "" (empty string).
- Never assume meaning.
- Never fabricate values.

====================================================
REQUIRED JSON OUTPUT FORMAT
====================================================
Return ONLY valid JSON in this exact structure:

{
  "patientDetails": {
    "name": "",
    "age": "",
    "date": ""
  },
  "doctorsNotes": {
    "complaint": "",
    "impression": "",
    "explanation": "",
    "onExamination": {
      "bp": "",
      "pr": "",
      "temp": "",
      "spo2": ""
    }
  },
  "treatmentAndAdvice": [
    {
      "item": "",
      "route": "",
      "dosage": "",
      "timing": "",
      "notes": "",
      "details": {
        "purpose": "",
        "mechanism": "",
        "commonSideEffects": "",
        "whyPrescribed": ""
      }
    }
  ],
  "rawExtractedText": "",
  "summary": ""
}

====================================================
DETAILS FIELD RULES (VERY IMPORTANT)
====================================================

1. If the item is a clearly identifiable medicine or therapeutic product
   (examples: ORS, 5% Dextrose, Paracetamol, Amoxicillin):
   → You MUST fill ALL fields: purpose, mechanism, commonSideEffects, whyPrescribed.
   → These must come from real-world standard medical knowledge.
   → DO NOT infer medicine names. Use item EXACTLY as in rawExtractedText.

2. If the item is general medical ADVICE (examples: “Adequate fluid intake”, “Rest”, “Ice pack”, “Hydration”):
   → DO NOT fill purpose/mechanism/commonSideEffects.
   → BUT DO fill “whyPrescribed” with a short medically accurate reason
     why the doctor would advise this action.
   Example: "whyPrescribed": "To maintain hydration and support recovery."

3. If the item is unclear, incomplete, unreadable, or ambiguous:
   → Leave all details fields empty.

4. Never guess, assume, or fabricate medicine names or therapeutic actions.

====================================================
SUMMARY RULES
====================================================
- Summary must be a short, friendly explanation of the prescription.
- Use only the clearly extracted data.
- NO markdown.
- NO backticks.
- NO bold.
- NO lists or bullets.
- Plain text only.

====================================================
FINAL ABSOLUTE RULES
====================================================
- Output MUST be ONLY valid JSON.
- No additional commentary.
- No markdown.
- No backticks.
- No explanations outside the JSON.
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
