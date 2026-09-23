"use client";

import { useRef } from "react";
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
  useTextReveal(headRef as React.RefObject<HTMLElement>);

  const p = service.i18nPrefix;
  const features = PLAN_FEATURES[service.id];
  const loc: Locale = locale;

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

        <div className="plans">
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
      </div>
    </section>
  );
}
