"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

export default function AtmosphereBackground() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    const anim = gsap.to(glow, {
      y: 400,
      x: 100,
      opacity: 0.08,
      scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: 1 },
    });

    return () => {
      anim.scrollTrigger?.kill();
      anim.kill();
    };
  }, []);

  return (
    <div className="atmosphere">
      <div className="glow" ref={glowRef} />
      <div className="grain" />
    </div>
  );
}
