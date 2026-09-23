"use client";

import { useRef } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useTextReveal } from "@/hooks/useTextReveal";
import { PROCESS_STEPS } from "@/lib/data/content";

export default function Process() {
  const { t } = useLanguage();
  const titleRef = useRef<HTMLHeadingElement>(null);
  useTextReveal(titleRef as React.RefObject<HTMLElement>);

  return (
    <section className="process">
      <div className="container">
        <div className="eyebrow">
          <span className="dot" />
          <span>{t("process.eyebrow")}</span>
        </div>
        <h2 ref={titleRef} style={{ fontSize: "clamp(28px,4.5vw,52px)", textTransform: "uppercase", marginBottom: 50 }}>
          {t("process.title")}
        </h2>
        <div className="process-list">
          {PROCESS_STEPS.map((s, i) => (
            <div className="process-item" key={s}>
              <span className="num">{`0${i + 1}`}</span>
              <h4>{t(`process.${s}t`)}</h4>
              <p>{t(`process.${s}d`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
