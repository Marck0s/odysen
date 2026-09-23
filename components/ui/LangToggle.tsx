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
        <img src="/assets/lang-flags/pt-lang.png" alt="Bandeira do Brasil" />
      </button>
      <button
        type="button"
        className={isEn ? "is-active" : ""}
        aria-label="English (United States)"
        aria-pressed={isEn}
        onClick={() => setLocale("en-US")}
      >
        <img src="/assets/lang-flags/en-lang.png" alt="United States flag" />
      </button>
      <span className="lang-thumb" aria-hidden="true">
        <img src={isEn ? "/assets/lang-flags/en-lang.png" : "/assets/lang-flags/pt-lang.png"} alt="" />
      </span>
    </div>
  );
}