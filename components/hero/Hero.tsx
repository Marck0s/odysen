"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useMotionPreference } from "@/lib/motion";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

interface HeroProps {
  startIntro: boolean;
}

export default function Hero({ startIntro }: HeroProps) {
  const { t } = useLanguage();
  const reduced = useMotionPreference();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (reduced) {
      gsap.set(root.querySelectorAll(".hero h1 .line span"), { y: "0%" });
      gsap.set(root.querySelector(".hero-sub"), { opacity: 1 });
      return;
    }

    if (!startIntro) return;

    gsap
      .timeline()
      .to(root.querySelectorAll(".hero h1 .line span"), {
        y: "0%",
        duration: 1,
        ease: "power4.out",
        stagger: 0.12,
      })
      .to(root.querySelector(".hero-sub"), { opacity: 1, duration: 0.8, ease: "power2.out" }, "-=.3");
  }, [startIntro, reduced]);

  return (
    <section className="hero container" ref={rootRef} id="top">
      <h1>
        <span className="line">
          <span dangerouslySetInnerHTML={{ __html: t("hero.line1") }} />
        </span>
        <span className="line">
          <span dangerouslySetInnerHTML={{ __html: t("hero.line2") }} />
        </span>
      </h1>
      <div className="hero-sub">
        <p>{t("hero.sub")}</p>
        <div className="scroll-cue">
          <span>{t("hero.scroll")}</span>
          <div className="line" />
        </div>
      </div>
    </section>
  );
}
