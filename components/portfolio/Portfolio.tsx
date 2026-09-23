"use client";

import { useRef } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useTextReveal } from "@/hooks/useTextReveal";
import { CASE_STUDIES } from "@/lib/data/content";

export default function Portfolio() {
  const { t } = useLanguage();
  const titleRef = useRef<HTMLHeadingElement>(null);
  useTextReveal(titleRef as React.RefObject<HTMLElement>);

  return (
    <section className="portfolio" id="portfolio">
      <div className="container">
        <div className="eyebrow">
          <span className="dot" />
          <span>{t("work.eyebrow")}</span>
        </div>
        <h2
          ref={titleRef}
          style={{ fontSize: "clamp(28px,4.5vw,52px)", textTransform: "uppercase", marginBottom: 50, maxWidth: 700 }}
        >
          {t("work.title")}
        </h2>
        <div className="case-list">
          {CASE_STUDIES.map((c) => (
            <div className="case-row" key={c.number}>
              <span className="cn">{c.number}</span>
              <h4>{c.name}</h4>
              <span className="tag">{c.tag}</span>
              <span className="go">{t("work.cta")} →</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
