// services/warnings.js
// A conservative, rule-based prescription warning engine.
// NOT a substitute for professional medical advice.
// Returns array of warnings: { code, severity, message, field, meta }

function normalizeName(name = "") {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s\-]/g, "")
    .trim();
}

function parseDosagePattern(dosage = "") {
  // Expect patterns like "1-0-1", "1 0 1", "1-1-1-1" etc
  const cleaned = String(dosage).trim();
  const parts = cleaned.split(/[\s\-\/,]+/).filter(Boolean);
  // convert numeric-looking to numbers, ignore words
  const nums = parts
    .map((p) => {
      const n = parseFloat(p);
      return Number.isNaN(n) ? null : n;
    })
    .filter((x) => x !== null);
  const total = nums.reduce((s, v) => s + v, 0);
  return { raw: cleaned, parts, nums, total };
}

const ANTIBIOTIC_KEYWORDS = [
  "cillin",
  "amoxi",
  "augmentin",
  "azithro",
  "cef",
  "ceph",
  "doxy",
  "cipro",
  "levo",
  "moxi",
  "erythro",
];

const STEROID_KEYWORDS = [
  "pred",
  "predsow",
  "prednisone",
  "dexa",
  "dexamethasone",
  "methylpred",
];
const NSAID_KEYWORDS = [
  "ibuprofen",
  "naproxen",
  "diclofenac",
  "aspirin",
  "nsaid",
  "etoricoxib",
];
const SEDATIVE_KEYWORDS = ["diazepam", "alprazolam", "lorazepam", "zolpidem"];

export function analyzePrescription(prescription) {
  // prescription is the final JSON (patientDetails, doctorsNotes, treatmentAndAdvice, summary, rawExtractedText...)
  const warnings = [];

  if (!prescription || typeof prescription !== "object") {
    warnings.push({
      code: "invalid_payload",
      severity: "high",
      message: "Invalid prescription payload. Expected JSON object.",
      field: null,
    });
    return warnings;
  }

  const meds = Array.isArray(prescription.treatmentAndAdvice)
    ? prescription.treatmentAndAdvice
    : [];

  // 1) Missing critical patient details
  const pd = prescription.patientDetails || {};
  if (!pd.name || String(pd.name).trim().length === 0) {
    warnings.push({
      code: "missing_patient_name",
      severity: "medium",
      message: "Patient name is missing. Please confirm patient identity.",
      field: "patientDetails.name",
    });
  }

  // 2) Iterate medicines
  const seenNames = new Map();
  for (let i = 0; i < meds.length; i++) {
    const m = meds[i];
    const idx = i;
    const original = m.item || "";
    const nameNormalized = normalizeName(original);

    // Track duplicates (exact or near-exact)
    if (nameNormalized) {
      if (seenNames.has(nameNormalized)) {
        warnings.push({
          code: "duplicate_medicine",
          severity: "medium",
          message: `Medicine appears multiple times (${original}). Confirm this is not duplicated.`,
          field: `treatmentAndAdvice[${idx}].item`,
          meta: { original, duplicateOf: seenNames.get(nameNormalized) },
        });
      } else {
        seenNames.set(nameNormalized, idx);
      }
    }

    // Missing dosage or timing detection
    const dosage = m.dosage || "";
    const timing = m.timing || "";
    if (!dosage || String(dosage).trim().length === 0) {
      warnings.push({
        code: "missing_dosage",
        severity: "medium",
        message: `Dosage not provided for "${original}". Please confirm dosage (e.g., 1-0-1).`,
        field: `treatmentAndAdvice[${idx}].dosage`,
      });
    } else {
      // parse dosage pattern
      const parsed = parseDosagePattern(dosage);
      if (parsed.total > 6) {
        warnings.push({
          code: "high_daily_dose",
          severity: "high",
          message: `Total daily units (${parsed.total}) for "${original}" looks high. Please verify with prescriber.`,
          field: `treatmentAndAdvice[${idx}].dosage`,
          meta: { totalPerDay: parsed.total },
        });
      } else if (parsed.total === 0 && parsed.parts.length > 0) {
        // parsed nothing numeric but dosage present
        warnings.push({
          code: "unrecognized_dosage_format",
          severity: "low",
          message: `Dosage format for "${original}" is unrecognized: "${dosage}". Consider using formats like 1-0-1 or "1 tablet twice daily".`,
          field: `treatmentAndAdvice[${idx}].dosage`,
        });
      }
    }

    if (!timing || String(timing).trim().length === 0) {
      warnings.push({
        code: "missing_timing",
        severity: "low",
        message: `Timing not specified for "${original}". E.g., "after meals", "stat", "once a day".`,
        field: `treatmentAndAdvice[${idx}].timing`,
      });
    }

    // 3) Antibiotic duration check
    const isAntibiotic = ANTIBIOTIC_KEYWORDS.some((k) =>
      nameNormalized.includes(k)
    );
    const durationPresent =
      (m.timing && /\b(day|days|week|weeks|for)\b/i.test(m.timing)) ||
      (m.notes && /\b(day|days|week|weeks|for)\b/i.test(m.notes));
    if (isAntibiotic && !durationPresent) {
      warnings.push({
        code: "missing_duration_antibiotic",
        severity: "high",
        message: `Duration missing for antibiotic "${original}". Antibiotics require a clear duration (e.g., "for 5 days") to ensure proper course.`,
        field: `treatmentAndAdvice[${idx}].timing`,
      });
    }

    // 4) Injectable / IV detection: if item suggests IV but route missing
    const looksInjectable =
      /\b(iv|intravenous|injection|inj\b)/i.test(original) ||
      /\b(iv|intravenous|injection|inj\b)/i.test(m.timing || "") ||
      /\b(iv|intravenous|injection|inj\b)/i.test(m.notes || "");
    if (
      looksInjectable &&
      (!m.route || !/iv|intravenous|im|intramuscular/i.test(m.route))
    ) {
      warnings.push({
        code: "missing_route_for_injection",
        severity: "high",
        message: `Medicine "${original}" looks like injectable/IV but route is not specified as IV/IM. Confirm administration route.`,
        field: `treatmentAndAdvice[${idx}].route`,
      });
    }

    // 5) Emergency / STAT detection
    if (
      /\b(stat|immediately|emergency|sos|asap)\b/i.test(
        original + " " + (m.timing || "") + " " + (m.notes || "")
      )
    ) {
      warnings.push({
        code: "urgent_instruction",
        severity: "high",
        message: `Prescription contains an urgent instruction for "${original}" (e.g., stat). Ensure immediate administration.`,
        field: `treatmentAndAdvice[${idx}].timing`,
      });
    }

    // 6) Flag sedative + opioid-like warnings (conservative)
    const isSedative = SEDATIVE_KEYWORDS.some((k) =>
      nameNormalized.includes(k)
    );
    if (isSedative) {
      warnings.push({
        code: "sedative_warning",
        severity: "medium",
        message: `Medicine "${original}" is a sedative-like medication. Advise caution with driving or operating machinery.`,
        field: `treatmentAndAdvice[${idx}].item`,
      });
    }
  } // end meds loop

  // 7) Simple interaction detector (very conservative)
  // We detect presence of steroid + nsaid combination, or multiple sedatives.
  const allNames = [...seenNames.keys()].join(" ");
  const foundSteroid = STEROID_KEYWORDS.some((k) => allNames.includes(k));
  const foundNSAID = NSAID_KEYWORDS.some((k) => allNames.includes(k));
  const foundSedative = SEDATIVE_KEYWORDS.some((k) => allNames.includes(k));
  if (foundSteroid && foundNSAID) {
    warnings.push({
      code: "steroid_nsaid_interaction",
      severity: "medium",
      message:
        "Combination of steroid and NSAID detected. This can increase risk of gastrointestinal side effects; review if gastroprotection is needed.",
      field: "treatmentAndAdvice",
    });
  }
  if (foundSedative) {
    // count sedatives roughly
    const sedCount = [...seenNames.keys()].filter((n) =>
      SEDATIVE_KEYWORDS.some((k) => n.includes(k))
    ).length;
    if (sedCount > 1) {
      warnings.push({
        code: "multiple_sedatives",
        severity: "high",
        message:
          "Multiple sedative-type medications detected. This increases risk of excessive sedation; verify dosing and interactions.",
        field: "treatmentAndAdvice",
      });
    }
  }

  // 8) If there are zero medicines, warn
  if (meds.length === 0) {
    warnings.push({
      code: "no_medicines_detected",
      severity: "low",
      message:
        "No medicines detected in the prescription. Confirm this is not a non-medication advice note.",
      field: "treatmentAndAdvice",
    });
  }

  // Return warnings sorted by severity (high → medium → low)
  const severityOrder = { high: 0, medium: 1, low: 2 };
  warnings.sort(
    (a, b) =>
      (severityOrder[a.severity] || 3) - (severityOrder[b.severity] || 3)
  );

  return warnings;
}

export default {
  analyzePrescription,
};
