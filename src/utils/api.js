// API functions for prescription reader

// Simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Base URL for the API
const API_BASE_URL = "https://multi-lingual-prescription-app.onrender.com/api";

export const uploadPrescription = async (formData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      ...data,
      confidence: 0.92, // Default confidence since API doesn't provide it
    };
  } catch (error) {
    console.error("Upload error:", error);
    throw new Error("Failed to upload prescription. Please try again.");
  }
};

export const generateSummary = async (prescriptionData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-summary`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(prescriptionData),
    });

    if (!response.ok) {
      throw new Error(
        `Summary generation failed with status: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Summary generation error:", error);
    throw new Error("Failed to generate summary. Please try again.");
  }
};

export const getWarnings = async (prescriptionData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/warnings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(prescriptionData),
    });

    if (!response.ok) {
      throw new Error(`Warnings fetch failed with status: ${response.status}`);
    }

    const data = await response.json();
    return data.warnings || [];
  } catch (error) {
    console.error("Warnings fetch error:", error);
    return [];
  }
};

export const getMedicineInfo = async (prescriptionData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/medicine-info`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(prescriptionData),
    });

    if (!response.ok) {
      throw new Error(
        `Medicine info fetch failed with status: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Medicine info fetch error:", error);
    return { medicines: [] };
  }
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

// Convert base64 to blob URL
export const base64ToBlobUrl = (base64Data, mimeType = "audio/mp3") => {
  try {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error converting base64 to blob:", error);
    return null;
  }
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
