"use client";

import { useRef } from "react";
import { useTilt } from "@/hooks/useMagnetic";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

interface PlanCardProps {
  name: string;
  desc: string;
  price: string;
  features: string[];
  recommended?: boolean;
  ctaLabel: string;
  ctaHref?: string;
}

export default function PlanCard({ name, desc, price, features, recommended, ctaLabel, ctaHref }: PlanCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  useTilt(cardRef as React.RefObject<HTMLElement>, 4);
  const { t } = useLanguage();

  return (
    <div className={`plan${recommended ? " rec" : ""}`} ref={cardRef}>
      {recommended && <span className="rec-badge">{t("plan.recommended")}</span>}
      <span className="plan-name">{name}</span>
      <p className="plan-position">{desc}</p>
      <div className="plan-price">{price}</div>
      <ul>
        {features.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      <a href={ctaHref ?? "#contato"} className={`btn${recommended ? " btn-primary" : ""}`}>
        {ctaLabel}
      </a>
    </div>
  );
}
