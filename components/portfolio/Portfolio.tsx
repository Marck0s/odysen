"use client";

import { useRef } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useTextReveal } from "@/hooks/useTextReveal";
import { PROJECTS } from "@/lib/data/content";

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
          dangerouslySetInnerHTML={{ __html: t("work.title") }}
          style={{ marginBottom: 50, maxWidth: 700 }}
        />
        <div className="project-grid">
          {PROJECTS.map((p) => (
            <article className="project-card" key={p.id}>
              <h3 className="project-name">{p.name}</h3>
              <span className="project-tag">{t(p.tag)}</span>
              <div className="project-image">
                <img src={p.image} alt={p.name} loading="lazy" width={1920} height={960} />
              </div>
              <a className="project-cta" href={p.url} target="_blank" rel="noopener noreferrer">
                {t("work.cta")} <span aria-hidden="true">→</span>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
