"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useTextReveal } from "@/hooks/useTextReveal";
import PlanCard from "./PlanCard";
import { PLAN_FEATURES } from "@/lib/data/services";
import type { ServiceDef } from "@/lib/data/services";
import type { Locale } from "@/lib/config";
import { whatsappLink } from "@/lib/config";

interface ServiceBlockProps {
  service: ServiceDef;
}

export default function ServiceBlock({ service }: ServiceBlockProps) {
  const { t, locale } = useLanguage();
  const headRef = useRef<HTMLHeadingElement>(null);
  const plansRef = useRef<HTMLDivElement>(null);
  const [activePlan, setActivePlan] = useState(0);
  useTextReveal(headRef as React.RefObject<HTMLElement>);

  const p = service.i18nPrefix;
  const features = PLAN_FEATURES[service.id];
  const loc: Locale = locale;
  const carouselLabel = locale === "pt-BR" ? "Planos" : "Plans";

  /** Active slide = the card whose center is closest to the container's
   *  center. Robust to the 28px padding, the 14px gap and any card width. */
  const handlePlansScroll = useCallback(() => {
    const container = plansRef.current;
    if (!container) return;
    const cards = Array.from(container.querySelectorAll<HTMLElement>(".plan"));
    if (cards.length === 0) return;
    const containerRect = container.getBoundingClientRect();
    const center = containerRect.left + container.clientWidth / 2;
    let next = 0;
    let best = Infinity;
    for (let i = 0; i < cards.length; i++) {
      const rect = cards[i].getBoundingClientRect();
      const dist = Math.abs(rect.left + rect.width / 2 - center);
      if (dist < best) {
        best = dist;
        next = i;
      }
    }
    setActivePlan((prev) => (prev === next ? prev : next));
  }, []);

  // Recompute on mount (browsers may restore scroll position on reload) and
  // on resize (mobile <-> desktop switches reset scrollLeft to 0).
  useEffect(() => {
    handlePlansScroll();
    window.addEventListener("resize", handlePlansScroll);
    return () => window.removeEventListener("resize", handlePlansScroll);
  }, [handlePlansScroll]);

  const scrollToPlan = (i: number) => {
    const container = plansRef.current;
    if (!container) return;
    const card = container.querySelectorAll<HTMLElement>(".plan")[i];
    if (!card) return;
    const containerRect = container.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    // Align the card's left edge with the container's 28px left padding.
    const target = container.scrollLeft + (cardRect.left - containerRect.left) - 28;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    container.scrollTo({ left: target, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <section className="service-block" id={service.anchor}>
      <div className="container">
        <div className="service-head">
          <div>
            <div className="eyebrow">
              <span className="dot" />
              <span>{t(`${p}.idx`)}</span>
            </div>
            <h3 ref={headRef} dangerouslySetInnerHTML={{ __html: t(`${p}.title`) }} />
          </div>
          <p className="desc">{t(`${p}.desc`)}</p>
        </div>

        <div className="benefits-row">
          {[1, 2, 3].map((n) => (
            <div className="benefit" key={n}>
              <span className="num">{`0${n}`}</span>
              <h5>{t(`${p}.b${n}t`)}</h5>
              <p>{t(`${p}.b${n}d`)}</p>
            </div>
          ))}
        </div>

        <div
          className="plans"
          ref={plansRef}
          onScroll={handlePlansScroll}
          tabIndex={0}
          role="region"
          aria-label={carouselLabel}
          id={`plans-${service.id}`}
        >
          {[0, 1, 2].map((i) => (
            <PlanCard
              key={i}
              name={t(`${p}.p${i + 1}name`)}
              desc={t(`${p}.p${i + 1}desc`)}
              price={t(`${p}.p${i + 1}price`)}
              features={features[i][loc]}
              recommended={i === 1}
              ctaLabel={i === 2 ? t("plan.cta.talk") : t("plan.cta.start")}
              ctaHref={i === 2 ? whatsappLink() : "#contato"}
            />
          ))}
        </div>

        <div className="plans-dots" role="group" aria-label={carouselLabel}>
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              type="button"
              aria-label={t(`${p}.p${i + 1}name`)}
              aria-current={activePlan === i ? "true" : undefined}
              aria-controls={`plans-${service.id}`}
              onClick={() => scrollToPlan(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
