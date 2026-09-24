"use client";

import { useRef } from "react";
import { useTextReveal } from "@/hooks/useTextReveal";

interface SplitSectionProps {
  id?: string;
  statementHtml: string;
  eyebrow: string;
  children: React.ReactNode;
}

export default function SplitSection({ id, statementHtml, eyebrow, children }: SplitSectionProps) {
  const statementRef = useRef<HTMLParagraphElement>(null);
  useTextReveal(statementRef as React.RefObject<HTMLElement>);

  return (
    <section className="split" id={id}>
      <div className="container split-grid">
        <div className="statement">
          <p ref={statementRef} dangerouslySetInnerHTML={{ __html: statementHtml }} />
        </div>
        <div className="body">
          <div className="eyebrow">
            <span className="dot" />
            <span>{eyebrow}</span>
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}
