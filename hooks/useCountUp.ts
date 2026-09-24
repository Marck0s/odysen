"use client";

import { useEffect, type RefObject } from "react";
import { gsap } from "@/lib/gsap";
import { useMotionPreference } from "@/lib/motion";

interface ParsedStat {
  target: number;
  suffix: string;
  pad: number;
}

/**
 * Parses a stat label like "04", "01" or "100%" into a numeric target plus
 * formatting hints (leading-zero padding and a suffix such as "%").
 */
function parseStat(text: string): ParsedStat | null {
  const match = text.match(/^(\d+)(.*)$/);
  if (!match) return null;
  const digits = match[1];
  const target = parseInt(digits, 10);
  const pad = digits.length > 1 && digits.startsWith("0") ? digits.length : 0;
  return { target, suffix: match[2], pad };
}

function formatStat(value: number, stat: ParsedStat): string {
  const num = stat.pad > 0 ? String(value).padStart(stat.pad, "0") : String(value);
  return num + stat.suffix;
}

/**
 * Count-up animation for stat values: every `[data-count]` element inside the
 * ref counts from 0 to its parsed target when the container enters the
 * viewport. The canonical value is read from the `data-count` attribute (never
 * from `textContent`, which the animation itself mutates — this keeps the hook
 * idempotent under React StrictMode double-invocation). Formatting (leading
 * zeros, suffixes like "%") is preserved, and reduced-motion users get the
 * final values immediately.
 */
export function useCountUp(ref: RefObject<HTMLElement>) {
  const reduced = useMotionPreference();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const nodes = Array.from(el.querySelectorAll<HTMLElement>("[data-count]"));
    if (nodes.length === 0) return;

    const stats = nodes.map((node) => parseStat(node.dataset.count ?? ""));
    if (stats.some((s) => !s)) return;

    if (reduced) {
      nodes.forEach((node, i) => {
        const stat = stats[i]!;
        node.textContent = formatStat(stat.target, stat);
      });
      return;
    }

    const state = { progress: 0 };
    const anim = gsap.fromTo(
      state,
      { progress: 0 },
      {
        progress: 1,
        duration: 1.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
        },
        onUpdate: () => {
          nodes.forEach((node, i) => {
            const stat = stats[i]!;
            node.textContent = formatStat(Math.round(stat.target * state.progress), stat);
          });
        },
      }
    );

    return () => {
      anim.scrollTrigger?.kill();
      anim.kill();
    };
  }, [ref, reduced]);
}