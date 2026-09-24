"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function LangToggle() {
  const { locale, setLocale } = useLanguage();
  const isEn = locale === "en-US";

  return (
    <div className={`lang-toggle${isEn ? " is-en" : ""}`}>
      <button
        type="button"
        className={locale === "pt-BR" ? "is-active" : ""}
        aria-label="Português (Brasil)"
        aria-pressed={locale === "pt-BR"}
        onClick={() => setLocale("pt-BR")}
      >
        <span className="lang-dot" aria-hidden="true" />
        <span className="lang-label">PT</span>
      </button>
      <button
        type="button"
        className={isEn ? "is-active" : ""}
        aria-label="English (United States)"
        aria-pressed={isEn}
        onClick={() => setLocale("en-US")}
      >
        <span className="lang-dot" aria-hidden="true" />
        <span className="lang-label">EN</span>
      </button>
    </div>
  );
}