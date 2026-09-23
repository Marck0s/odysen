"use client";

import { useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { FAQ_ITEMS } from "@/lib/data/content";

export default function Faq() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [openHeights, setOpenHeights] = useState<Record<number, number>>({});
  const answerRefs = useRef<Array<HTMLDivElement | null>>([]);

  const toggle = (i: number) => {
    if (openIndex === i) {
      setOpenIndex(null);
      return;
    }
    // Measure in the event handler (never during render) so the closed
    // max-height:0 can animate up to exactly the content height.
    const el = answerRefs.current[i];
    if (el) setOpenHeights((h) => ({ ...h, [i]: el.scrollHeight }));
    setOpenIndex(i);
  };

  return (
    <section className="faq">
      <div className="container faq-inner">
        <div className="eyebrow">
          <span className="dot" />
          <span>{t("faq.eyebrow")}</span>
        </div>
        {FAQ_ITEMS.map((n, i) => {
          const isOpen = openIndex === i;
          return (
            <div className={`faq-item${isOpen ? " open" : ""}`} key={n}>
              <button className="faq-q" onClick={() => toggle(i)}>
                <span>{t(`faq.q${n}`)}</span>
                <span className="plus">+</span>
              </button>
              <div
                className="faq-a"
                ref={(el) => {
                  answerRefs.current[i] = el;
                }}
                style={{ maxHeight: isOpen ? openHeights[i] ?? 200 : 0 }}
              >
                <p>{t(`faq.a${n}`)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}