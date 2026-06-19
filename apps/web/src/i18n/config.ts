import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "zh", label: "中文" },
  { code: "ja", label: "日本語" },
] as const;

void i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .init({
    fallbackLng: "en",
    supportedLngs: ["en", "zh", "ja"],
    defaultNS: "common",
    ns: ["common"],
    interpolation: { escapeValue: false },
    backend: { loadPath: "/locales/{{lng}}/{{ns}}.json" },
    detection: { order: ["localStorage", "navigator", "htmlTag"], caches: ["localStorage"] },
    react: { useSuspense: false },
  });

export default i18n;
