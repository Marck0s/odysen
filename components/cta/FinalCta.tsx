"use client";

import { useRef } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useTextReveal } from "@/hooks/useTextReveal";
import { useMagnetic } from "@/hooks/useMagnetic";
import { whatsappLink } from "@/lib/config";

export default function FinalCta() {
  const { t } = useLanguage();
  const headRef = useRef<HTMLHeadingElement>(null);
  useTextReveal(headRef as React.RefObject<HTMLElement>);
  const talkRef = useRef<HTMLAnchorElement>(null);
  const exploreRef = useRef<HTMLAnchorElement>(null);
  useMagnetic(talkRef as React.RefObject<HTMLElement>, 0.2);
  useMagnetic(exploreRef as React.RefObject<HTMLElement>, 0.2);

  return (
    <section className="final-cta" id="contato">
      <div className="container">
        <div className="eyebrow" style={{ justifyContent: "center" }}>
          <span className="dot" />
          <span>{t("cta.eyebrow")}</span>
        </div>
        <h2 ref={headRef} dangerouslySetInnerHTML={{ __html: t("cta.headline") }} />
        <div className="btn-row">
          <a href={whatsappLink()} className="btn btn-primary" ref={talkRef}>
            <span>{t("cta.talk")}</span>
            <span className="arrow">→</span>
          </a>
          <a href="#servicos" className="btn" ref={exploreRef}>
            <span>{t("cta.explore")}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
