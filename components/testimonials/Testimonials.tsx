"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useMotionPreference } from "@/lib/motion";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { TESTIMONIALS } from "@/lib/data/content";

export default function Testimonials() {
  const { t } = useLanguage();
  const reduced = useMotionPreference();
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const section = sectionRef.current;
    if (!track || !section || reduced) return;

    const getMax = () => track.scrollWidth - window.innerWidth + 100;

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top 70%",
      end: "bottom top",
      scrub: 1,
      onUpdate: (self) => {
        gsap.set(track, { x: -self.progress * getMax() });
      },
    });

    return () => st.kill();
  }, [reduced]);

  return (
    <section className="testimonials" ref={sectionRef}>
      <div className="container" style={{ marginBottom: 50 }}>
        <div className="eyebrow">
          <span className="dot" />
          <span>{t("test.eyebrow")}</span>
        </div>
      </div>
      <div className="t-track" ref={trackRef}>
        {TESTIMONIALS.map((item) => (
          <div className="t-card" key={item.initials}>
            <p className="quote">&quot;{item.quote}&quot;</p>
            <div className="who">
              <div className="dot">{item.initials}</div>
              <div>
                <strong>{item.name}</strong>
                <span>{item.company}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
