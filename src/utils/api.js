// Mock API functions for prescription reader

// Sample prescription data structure matching the desired JSON format
const mockPrescriptionData = {
  patientDetails: {
    name: "Sachin Bansare",
    age: "28",
    date: "12/20/22",
  },
  doctorsNotes: {
    complaint: "Dental pain and swelling",
    impression: "Dental infection",
    explanation: "Patient presents with tooth pain and gum inflammation",
    onExamination: {
      bp: "120/80",
      pr: "72",
      temp: "98.6°F",
      spo2: "99%",
    },
  },
  treatmentAndAdvice: [
    {
      item: "Augmentin 625mg tablet",
      route: "oral",
      dosage: "1-0-1",
      timing: "after meals, for 5 days",
      notes: "Complete full course",
    },
    {
      item: "Evaflam tablet",
      route: "oral",
      dosage: "1-0-1",
      timing: "after meals, for 5 days",
      notes: "Take with water",
    },
    {
      item: "PariD 40mg tablet",
      route: "oral",
      dosage: "1-0-0",
      timing: "before meals, for 5 days",
      notes: "Avoid antacids",
    },
    {
      item: "Hexigel gum paint",
      route: "topical",
      dosage: "massage 1-0-1",
      timing: "once a week",
      notes: "Apply gently on affected area",
    },
  ],
  canonical: [
    "Augmentin 625mg tablet via oral, dosage: 1-0-1, timing: after meals, for 5 days",
    "Evaflam tablet via oral, dosage: 1-0-1, timing: after meals, for 5 days",
    "PariD 40mg tablet via oral, dosage: 1-0-0, timing: before meals, for 5 days",
    "Hexigel gum paint via topical, dosage: massage 1-0-1, timing: once a week",
  ],
  summaryEnglish:
    "Mr. Sachin Bansare, age 28, is prescribed Augmentin 625mg tablet twice daily after meals, Evaflam tablet twice daily after meals, and PariD 40mg tablet once daily before meals, each for 5 days. Additionally, Hexigel gum paint should be applied and massaged once a week.",
  summaryTranslated:
    "श्री सचिन बनसारे, उम्र 28 वर्ष, को ऑगमेंटिन 625 मिलीग्राम की गोली दिन में दो बार खाने के बाद, एवाफ्लैम गोली दिन में दो बार खाने के बाद, और पैरिड 40 मिलीग्राम की गोली दिन में एक बार खाने से पहले, प्रत्येक 5 दिनों के लिए निर्धारित की गई है। इसके अतिरिक्त, हेक्सिजेल गम पेंट को सप्ताह में एक बार लगाकर मालिश करनी चाहिए।",
};

// Simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const uploadPrescription = async (file, language) => {
  await delay(1500);
  return {
    success: true,
    rawOCRText: mockPrescriptionData.treatmentAndAdvice
      .map((t) => `${t.item} ${t.dosage} ${t.timing}`)
      .join("\n"),
    confidence: 0.92,
  };
};

export const extractOCRText = async (imageFile) => {
  await delay(1200);
  return {
    text: mockPrescriptionData.treatmentAndAdvice
      .map((t) => `${t.item} ${t.dosage} ${t.timing}`)
      .join("\n"),
    confidence: 0.92,
  };
};

export const parseOCR = async (text) => {
  await delay(800);
  return {
    ...mockPrescriptionData,
    confidence: 0.92,
    warnings: [],
  };
};

export const translateText = async (text, targetLanguage) => {
  await delay(600);

  const translations = {
    hi: "नुस्खा सफलतापूर्वक प्रसंस्कृत किया गया",
    gu: "પ્રિસ્ક્રિપ્શન સફળતાપૂર્વક પ્રક્રિયા કરવામાં આવી છે",
    mr: "प्रिस्क्रिप्शन यशस्वीपणे प्रक्रिया केली गेली",
    ta: "மருந்தா஬ற்றை வெற்றிகரமாக செயல்படுத்தப்பட்டது",
    te: "ప్రిస్క్రిప్షన్ విజయవంతంగా ప్రాసెస్ చేయబడింది",
  };

  return translations[targetLanguage] || text;
};

export const generateAudio = async (text, language) => {
  await delay(2000);

  // Return mock audio URL - in production, this would be a real audio file
  return "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
};

// Language-specific instructions
export const getSimplifiedInstructions = (medicines, language) => {
  // Convert treatmentAndAdvice to medicines format for compatibility
  const formattedMedicines = medicines.map((med) => {
    const dosageParts = med.dosage.split("-");
    return {
      name: med.item,
      strength: med.item.match(/\d+mg/)?.[0] || "",
      dosage: {
        morning: parseInt(dosageParts[0]) || 0,
        afternoon: parseInt(dosageParts[1]) || 0,
        night: parseInt(dosageParts[2]) || 0,
      },
      duration: med.timing.match(/for \d+ days/)?.[0] || med.timing,
      food: med.timing.includes("before meals")
        ? "before meals"
        : med.timing.includes("after meals")
        ? "after meals"
        : "with water",
      route: med.route,
    };
  });

  const instructions = formattedMedicines
    .map((med) => {
      let instruction = `${med.name} ${med.strength}\n`;

      if (med.dosage.morning)
        instruction += `Morning: ${med.dosage.morning} tablet\n`;
      if (med.dosage.afternoon)
        instruction += `Afternoon: ${med.dosage.afternoon} tablet\n`;
      if (med.dosage.night)
        instruction += `Night: ${med.dosage.night} tablet\n`;

      instruction += `Duration: ${med.duration}\n`;
      instruction += `Food: Take ${med.food}`;

      return instruction;
    })
    .join("\n\n---\n\n");

  return instructions;
};
