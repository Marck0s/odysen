"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import SplitSection from "@/components/shared/SplitSection";

export default function About() {
  const { t } = useLanguage();

  return (
    <SplitSection id="sobre" statementHtml={t("about.statement")} eyebrow={t("about.eyebrow")}>
      <p>{t("about.p1")}</p>
      <p>{t("about.p2")}</p>
      <div className="stat-row">
        <div className="stat">
          <h4>04</h4>
          <span>{t("about.stat1")}</span>
        </div>
        <div className="stat">
          <h4>01</h4>
          <span>{t("about.stat2")}</span>
        </div>
        <div className="stat">
          <h4>100%</h4>
          <span>{t("about.stat3")}</span>
        </div>
      </div>
    </SplitSection>
  );
}
