"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useMotionPreference } from "@/lib/motion";

export interface PlansRevealState {
  open: boolean;
  toggle: () => void;
  /** `.plans-reveal` — the height-animated clipping shell. */
  panelRef: RefObject<HTMLDivElement>;
  /** `.plans-reveal-inner` — carries the static top padding and the rise. */
  innerRef: RefObject<HTMLDivElement>;
  /** `.plans` — the carousel container (scroll listener, aria-controls target). */
  plansRef: RefObject<HTMLDivElement>;
  /** `.plans-dots` — the mobile dot row. */
  dotsRef: RefObject<HTMLDivElement>;
  /** Client-wide `prefers-reduced-motion`; the reveal animation branches on it. */
  reduced: boolean;
}

/**
 * Motion, in seconds, and in the site's own vocabulary.
 *
 * The reveal is anchored to `--dur-m` (0.7s) and `--ease`, whose cubic-bezier is
 * closest to GSAP's `power3.out`. The collapse is ~2x faster on purpose:
 * opening is the deliberate, generous move, closing should feel disposable.
 */
const OPEN_SHELL = 0.7;
const OPEN_CONTENT = 0.5;
const OPEN_STAGGER = 0.05;
const OPEN_LEAD = 0.08;
const RISE = 24;

const CLOSE_CONTENT = 0.22;
const CLOSE_STAGGER = 0.02;
const CLOSE_SHELL = 0.28;
/** The box starts closing a hair after the fade: overlap, never a queue. */
const CLOSE_LEAD = 0.04;
const LIFT = 10;

/** Debounce for the post-settle refresh: rapid toggling must not re-measure
 *  every trigger once per settle. */
const REFRESH_DEBOUNCE = 140;

/**
 * Collapsed-by-default disclosure for a service's plan cards.
 *
 * The plans stay mounted at all times: the carousel's active-slide detection,
 * each card's tilt handler and any ScrollTrigger measurement all depend on those
 * nodes existing, so this hook never unmounts them. It only flips `inert` to
 * pull the hidden subtree out of the tab order — set imperatively because React
 * 18.3 does not accept `inert` as a boolean JSX prop.
 *
 * The end states are CSS's (`.plans-reveal` is `height: 0`; `[data-open]`
 * is `height: auto` — a presence selector, because `toggleAttribute` below
 * writes `data-open=""`, not `data-open="true"`) and the `data-open`
 * attribute is this hook's, flipped only
 * when a tween settles. That split is what makes the prerendered HTML paint
 * collapsed before any script runs, and it is also why `ServiceBlock` must not
 * render the attribute from React state: React would flip it on click, while the
 * inline height is still mid-tween and authoritative.
 *
 * The motion is one height tween on the shell plus an opacity/rise cascade on
 * the content. The rise lives on `.plans-reveal-inner`, never on the cards:
 * `useTilt` owns the cards' transform (rotateX/rotateY + transformPerspective
 * on mousemove) and their `:hover` lift is a CSS rule, so the only property this
 * hook writes on a `.plan` is `opacity` — the two never fight, and
 * `clearProps("transform")` (which would nuke the tilt) is never needed.
 */
export function usePlansReveal(): PlansRevealState {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const plansRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const reduced = useMotionPreference();

  const tlRef = useRef<gsap.core.Timeline | null>(null);
  /** True only while nothing is animating — the one moment this hook may
   *  assert a whole start state. Mid-flight the panel is somewhere between 0
   *  and natural, and the next tween has to resume from exactly there. */
  const settledRef = useRef(true);
  /** Flipped by `toggle`, not by the effect: StrictMode replays the mount
   *  effect, and a "first run" flag consumed by the effect would make the
   *  second pass play a collapse nobody asked for. */
  const touchedRef = useRef(false);
  /** Natural content height the in-flight tween is heading for. */
  const naturalRef = useRef(0);
  const refreshRef = useRef<number | null>(null);

  const toggle = useCallback(() => {
    touchedRef.current = true;
    setOpen((prev) => !prev);
  }, []);

  // Layout effect, not effect: the collapsed subtree is already height 0 in CSS
  // (so it paints clipped), but `overflow: hidden` does not remove descendants
  // from the tab order. Running in the commit phase means `inert` lands in the
  // same frame the DOM is written, so a keyboard user never lands on a focus
  // stop with no visible target.
  useLayoutEffect(() => {
    const hidden = [plansRef.current, dotsRef.current];
    for (const el of hidden) el?.toggleAttribute("inert", !open);
  }, [open]);

  const scheduleRefresh = useCallback(() => {
    if (refreshRef.current !== null) window.clearTimeout(refreshRef.current);
    refreshRef.current = window.setTimeout(() => {
      refreshRef.current = null;
      // A bare refresh() is the right call: it re-measures every trigger's
      // start/end and never touches window.scroll, and nothing on this page is
      // ScrollTrigger-pinned (the phone story pins with CSS `position: sticky`),
      // so there is no pin spacing to redistribute.
      ScrollTrigger.refresh();
    }, REFRESH_DEBOUNCE);
  }, []);

  const run = useCallback(
    (next: boolean) => {
      const panel = panelRef.current;
      const inner = innerRef.current;
      const plans = plansRef.current;
      if (!panel || !inner || !plans) return;

      const cards = plans.querySelectorAll<HTMLElement>(".plan");
      // The inner's own box, not `panel.scrollHeight`: scrollHeight grows with
      // the inner's in-flight translate, getBoundingClientRect does not.
      const natural = inner.getBoundingClientRect().height;
      const fromRest = settledRef.current;
      const heightBefore = panel.getBoundingClientRect().height;
      naturalRef.current = natural;

      // Kill, never revert: the values written on the last rendered frame stay
      // inline, so a tween interrupted at 40% resumes from 40% instead of
      // snapping back to 0 and playing again.
      tlRef.current?.kill();
      tlRef.current = null;

      const settle = () => {
        settledRef.current = true;
        tlRef.current = null;
        // The resting state belongs to CSS, in both directions. clearProps drops
        // the inline height and the attribute selects the end state it hands back
        // to: "auto" is the point of the open settle, because a frozen pixel
        // height would clip the panel after a locale switch, a theme swap or a
        // late font load — and a plain `gsap.set({height: 0})` on the close
        // settle would buy that same reflow for the other end. Attribute first,
        // clearProps second: while both are true the inline height still wins, so
        // the swap is a single frame with no intermediate box.
        //
        // The flip lives here, not on click, so the inline height stays
        // authoritative for every frame of the tween; the collapsed end needs no
        // attribute at all, which is exactly what makes the prerender correct.
        panel.toggleAttribute("data-open", next);
        gsap.set(panel, { clearProps: "height" });
        gsap.set(inner, { clearProps: "opacity,transform" });
        // Opacity only, on the cards — see the note at the top of the file.
        gsap.set(cards, { clearProps: "opacity" });
        // Only the shell moves the document, and only a moved document leaves
        // the triggers below the services section with stale positions.
        if (Math.abs(panel.getBoundingClientRect().height - heightBefore) > 0.5) {
          scheduleRefresh();
        }
      };

      // Reduced motion, and the mount pass: both snap. This is no longer about
      // the first paint — the collapsed default is `.plans-reveal { height: 0 }`,
      // so the prerendered HTML paints collapsed with no script at all, and
      // `useLayoutEffect` could never have un-painted what the browser already
      // showed. The mount pass earns its keep differently: `run` is re-entered
      // for reasons that are not user gestures (the `reduced` dependency re-runs
      // it right after hydration for a reduced-motion visitor, and a StrictMode
      // replay lands here as well), and every one of those re-entries has to
      // leave a coherent resting state — no stale inline height or opacity, the
      // `data-open` attribute consistent with it, `inert` and the ScrollTrigger
      // bookkeeping right — instead of a half-written frame a later tween would
      // resume from.
      if (reduced || !touchedRef.current) {
        settledRef.current = true;
        settle();
        return;
      }

      if (fromRest) {
        gsap.set(inner, { opacity: next ? 0 : 1, y: next ? RISE : 0 });
        gsap.set(cards, { opacity: next ? 0 : 1 });
      }

      // A settled panel already at its target needs no tween — e.g. reduced
      // motion was turned off while the panel sat open, and the effect re-ran.
      // Both sides of this comparison are now CSS-fed rather than GSAP-fed: at
      // rest the shell is either `height: 0` (collapsed) or `height: auto` via
      // `data-open` with the inline height cleared, and `auto` resolves to the
      // inner's box because the shell carries no padding or border of its own
      // and the inner's transform is cleared at rest — so the equality against
      // `natural` below is exact, not approximate.
      const atTarget = next
        ? Math.abs(panel.getBoundingClientRect().height - natural) < 0.5
        : panel.getBoundingClientRect().height < 0.5;
      if (fromRest && atTarget) {
        settledRef.current = true;
        settle();
        return;
      }

      const tl = gsap.timeline({
        // "auto" kills only the properties this tween shares with an older one
        // (height / opacity / y); `true` would take the cards' rotations with
        // it. The one in-flight timeline is killed explicitly above, so this is
        // the guard, not the mechanism.
        defaults: { overwrite: "auto" },
        onComplete: settle,
      });
      tlRef.current = tl;
      settledRef.current = false;

      if (next) {
        // The shell is the last thing to settle (0.68s of content inside 0.7s),
        // so the box reads as opening around content that has already arrived.
        tl
          .to(panel, { height: natural, duration: OPEN_SHELL, ease: "power3.out" }, 0)
          .to(inner, { opacity: 1, y: 0, duration: OPEN_CONTENT, ease: "power2.out" }, 0)
          .to(
            cards,
            {
              opacity: 1,
              duration: OPEN_CONTENT,
              ease: "power3.out",
              stagger: OPEN_STAGGER,
            },
            OPEN_LEAD,
          );
      } else {
        // The fade leads and the shell collapses underneath it, so the panel
        // never reads as "content waits, then the box shrinks".
        tl
          .to(inner, { opacity: 0, y: -LIFT, duration: CLOSE_CONTENT, ease: "power2.in" }, 0)
          .to(
            cards,
            {
              opacity: 0,
              duration: CLOSE_CONTENT,
              ease: "power2.in",
              stagger: CLOSE_STAGGER,
            },
            0,
          )
          .to(panel, { height: 0, duration: CLOSE_SHELL, ease: "power2.out" }, CLOSE_LEAD);
      }
    },
    [reduced, scheduleRefresh],
  );

  // Layout effect, not effect: a toggle has to write its tween's start state in
  // the click's frame — the browser must not get a paint of the untouched
  // resting state first — and the mount/StrictMode pass has to assert its
  // resting state before the first paint that observes it. Nothing about the
  // *initial* collapsed paint depends on this: that is CSS's, and it is correct
  // whether or not this ever runs.
  useLayoutEffect(() => {
    run(open);
  }, [open, reduced, run]);

  // The natural height moves under an open panel at the 980px and 768px
  // breakpoints, on a locale switch and on a late font load. A settled open
  // panel is already CSS `height: auto`, so it re-flows by itself; only an
  // in-flight tween — holding a now-stale pixel target — needs rebuilding, which
  // is what the `tlRef` guard below selects for. rAF-throttled so a
  // drag-resize cannot thrash it. (ScrollTrigger re-measures its own triggers on
  // resize, 200ms after it stops; that covers the page, not this hook's inline
  // height.)
  useEffect(() => {
    if (!open) return;
    const inner = innerRef.current;
    if (!inner) return;
    let frame = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!tlRef.current) return;
        const next = inner.getBoundingClientRect().height;
        if (Math.abs(next - naturalRef.current) > 0.5) run(open);
      });
    });
    ro.observe(inner);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [open, run]);

  useEffect(
    () => () => {
      tlRef.current?.kill();
      tlRef.current = null;
      if (refreshRef.current !== null) window.clearTimeout(refreshRef.current);
    },
    [],
  );

  return { open, toggle, panelRef, innerRef, plansRef, dotsRef, reduced };
}
