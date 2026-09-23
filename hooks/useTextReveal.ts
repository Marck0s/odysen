"use client";

import { useEffect, type RefObject } from "react";
import { gsap } from "@/lib/gsap";
import { useMotionPreference } from "@/lib/motion";

/**
 * Restrained entrance animation for section headlines: a single fade + rise,
 * triggered once the element is ~85% into the viewport. Deliberately avoids
 * scattering the same fade-up on every element on the page.
 */
export function useTextReveal(ref: RefObject<HTMLElement>) {
  const reduced = useMotionPreference();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduced) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }

    const anim = gsap.fromTo(
      el,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 85%" },
      }
    );

    return () => {
      anim.scrollTrigger?.kill();
      anim.kill();
    };
  }, [ref, reduced]);
}