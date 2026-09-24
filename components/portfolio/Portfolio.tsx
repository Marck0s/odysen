"use client";

import { useRef } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useTextReveal } from "@/hooks/useTextReveal";
import { CASE_STUDIES, PROJECTS } from "@/lib/data/content";

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
        <div className="project-grid">
          {PROJECTS.map((p) => (
            <article className="project-card" key={p.id}>
              <h3 className="project-name">{p.name}</h3>
              <div className="project-image">
                <img src={p.image} alt={p.name} loading="lazy" width={1920} height={960} />
              </div>
              <a className="project-cta" href={p.url} target="_blank" rel="noopener noreferrer">
                {t("work.cta")} <span aria-hidden="true">→</span>
              </a>
            </article>
          ))}
        </div>
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
