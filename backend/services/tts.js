import gTTS from "gtts";

export async function generateAudio(text, lang) {
  return new Promise((resolve, reject) => {
    try {
      const gtts = new gTTS(text, lang);

      // Instead of saving to a file, save to memory buffer
      const chunks = [];
      gtts
        .stream()
        .on("data", (chunk) => chunks.push(chunk))
        .on("end", () => resolve(Buffer.concat(chunks)))
        .on("error", (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
}
