"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer>
      <div className="container footer-inner">
        <div className="logo">
          <img src="/assets/odysen-logo/odysen-vertical-logo.png" alt="Odysen" className="logo-mark" />
        </div>
        <div className="cols">
          <div>
            <a href="#servicos">{t("nav.services")}</a>
            <a href="#portfolio">{t("nav.work")}</a>
            <a href="#sobre">{t("nav.about")}</a>
          </div>
          <div>
            <a href="#contato">{t("nav.contact")}</a>
          </div>
        </div>
        <span className="muted" style={{ fontSize: 13 }}>
          {t("footer.rights")}
        </span>
      </div>
    </footer>
  );
}
