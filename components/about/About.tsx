"use client";

import { useRef } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import SplitSection from "@/components/shared/SplitSection";
import { useCountUp } from "@/hooks/useCountUp";

export default function About() {
  const { t } = useLanguage();
  const statsRef = useRef<HTMLDivElement>(null);
  useCountUp(statsRef);

  return (
    <SplitSection id="sobre" statementHtml={t("about.statement")} eyebrow={t("about.eyebrow")}>
      <p>{t("about.p1")}</p>
      <p>{t("about.p2")}</p>
      <div className="stat-row" ref={statsRef}>
        <div className="stat">
          <h4 data-count="04">04</h4>
          <span>{t("about.stat1")}</span>
        </div>
        <div className="stat">
          <h4 data-count="01">01</h4>
          <span>{t("about.stat2")}</span>
        </div>
        <div className="stat">
          <h4 data-count="100%">100%</h4>
          <span>{t("about.stat3")}</span>
        </div>
      </div>
    </SplitSection>
  );
}
