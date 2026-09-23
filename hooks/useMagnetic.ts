"use client";

import { useEffect, type RefObject } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Adds a subtle magnetic pull toward the cursor on hover, and a tilt
 * effect for card-like elements. Cleans up its own listeners.
 */
export function useMagnetic(ref: RefObject<HTMLElement>, strength = 0.25) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * strength;
      const y = (e.clientY - r.top - r.height / 2) * (strength * 1.6);
      gsap.to(el, { x, y, duration: 0.3, ease: "power2.out" });
    };
    const onLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.4, ease: "power2.out" });
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [ref, strength]);
}

/** Subtle 3D tilt on hover, for cards. */
export function useTilt(ref: RefObject<HTMLElement>, amount = 4) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const rx = ((e.clientY - r.top) / r.height - 0.5) * -amount;
      const ry = ((e.clientX - r.left) / r.width - 0.5) * amount;
      gsap.to(el, {
        rotateX: rx,
        rotateY: ry,
        duration: 0.4,
        ease: "power2.out",
        transformPerspective: 800,
      });
    };
    const onLeave = () => {
      gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.5, ease: "power2.out" });
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [ref, amount]);
}