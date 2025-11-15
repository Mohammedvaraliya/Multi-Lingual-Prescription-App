import { LingoDotDevEngine } from "lingo.dev/sdk";

const lingo = new LingoDotDevEngine({
  apiKey: process.env.LINGODOTDEV_API_KEY,
});

export async function translateLingo(text, targetLocale) {
  try {
    const result = await lingo.localizeText(text, {
      sourceLocale: "en",
      targetLocale: targetLocale,
    });

    return result || text;
  } catch (err) {
    console.error("Lingo error:", err);
    return text;
  }
}
