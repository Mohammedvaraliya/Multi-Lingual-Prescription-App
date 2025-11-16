import { useTranslate } from "../hooks/useTranslate";

export const LanguageSelector = () => {
  const { locale, setLocale } = useTranslate();

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value)}
      className="w-full border p-3 rounded-lg"
    >
      <option value="en">English</option>
      <option value="hi">Hindi</option>
      <option value="gu">Gujarati</option>
      <option value="mr">Marathi</option>
      <option value="bn">Bengali</option>
      <option value="ta">Tamil</option>
      <option value="te">Telugu</option>
      <option value="kn">Kannada</option>
      <option value="ml">Malayalam</option>
      <option value="pa">Punjabi</option>
      <option value="ur">Urdu</option>
      <option value="ne">Nepali</option>
      <option value="si">Sinhala</option>
      <option value="or">Odia</option>
      <option value="as">Assamese</option>
    </select>
  );
};
