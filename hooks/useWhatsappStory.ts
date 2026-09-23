"use client";

import { useEffect, type RefObject } from "react";
import { gsap } from "@/lib/gsap";
import { useMotionPreference } from "@/lib/motion";

export interface BubbleConfig {
  ref: RefObject<HTMLDivElement>;
  text: string;
  mode: "type" | "reveal";
}

interface UseWhatsappStoryArgs {
  sectionRef: RefObject<HTMLElement>;
  chatListRef: RefObject<HTMLDivElement>;
  bodyRef: RefObject<HTMLDivElement>;
  boxRef: RefObject<HTMLDivElement>;
  cameraRef: RefObject<HTMLDivElement>;
  galleryRef: RefObject<HTMLDivElement>;
  inputbarRef: RefObject<HTMLDivElement>;
  blackTransitionRef: RefObject<HTMLDivElement>;
  backwholeRef: RefObject<HTMLDivElement>;
  captionRef: RefObject<HTMLDivElement>;
  bubbles: BubbleConfig[];
  products: RefObject<HTMLDivElement>[];
  headline1: string;
  headline2: string;
}

/**
 * Tinker-style pinned phone with a live conversation:
 * - Desktop: the phone does a slight zoom-in anchored at its top (focusing the
 *   first message), then the view descends through the conversation as
 *   messages and product cards arrive, and finally dives into the inputbar to
 *   reveal the gallery — all scrubbed to scroll. The device stays fixed
 *   (sticky) while the page scrolls.
 * - Mobile: no pinned/scroll-locked sequence. The phone shows the full
 *   conversation statically in the normal flow and, on a looping timeline, it
 *   fades away while the odysen-banners cards replace each other one by one in
 *   the same slot; then the phone returns and the cycle repeats. The loop
 *   plays while the section is on screen.
 * Falls back to a fully-visible static state when reduced motion is on.
 */
export function useWhatsappStory({
  sectionRef,
  chatListRef,
  bodyRef,
  boxRef,
  cameraRef,
  galleryRef,
  inputbarRef,
  blackTransitionRef,
  backwholeRef,
  captionRef,
  bubbles,
  products,
  headline1,
  headline2,
}: UseWhatsappStoryArgs) {
  const reduced = useMotionPreference();

  useEffect(() => {
    const section = sectionRef.current;
    const list = chatListRef.current;
    const body = bodyRef.current;
    const box = boxRef.current;
    const camera = cameraRef.current;
    const gallery = galleryRef.current;
    const inputbar = inputbarRef.current;
    const blackTransition = blackTransitionRef.current;
    const backwhole = backwholeRef.current;
    if (!section || !list || !body || !box || !camera || !gallery || !inputbar || !blackTransition || !backwhole) return;
    const storyFx = camera.querySelector<HTMLElement>('.floating-lines-container');

    const els = bubbles
      .map((b) => b.ref.current)
      .filter((el): el is HTMLDivElement => Boolean(el));
    const cardEls = products
      .map((p) => p.current)
      .filter((el): el is HTMLDivElement => Boolean(el));
    const timeEls = Array.from(list.querySelectorAll<HTMLElement>(".bubble-time"));
    const barTrack = body.querySelector<HTMLElement>(".phone-scrollbar-track");
    const barThumb = body.querySelector<HTMLElement>(".phone-scrollbar-thumb");
    const barTravel = () => {
      if (!barTrack || !barThumb) return 0;
      const trackH = barTrack.getBoundingClientRect().height;
      const thumbH = barThumb.getBoundingClientRect().height;
      return Math.max(0, trackH - thumbH);
    };

    if (reduced) {
      els.forEach((el, i) => {
        el.textContent = bubbles[i].text;
        gsap.set(el, { opacity: 1, y: 0, scale: 1 });
      });
      cardEls.forEach((el) => gsap.set(el, { opacity: 1, y: 0, scale: 1 }));
      gsap.set(timeEls, { opacity: 1 });
      gsap.set(box, { opacity: 1, scale: 1 });
      gsap.set(list, { y: 0, scale: 1 });
      gsap.set(camera, { scale: 1, y: 0 });
      gallery.dispatchEvent(new Event("dolly-gallery:stop"));
      if (storyFx) gsap.set(storyFx, { opacity: 1 });
      gsap.set(inputbar, {
        backgroundColor: "#121214",
        borderColor: "rgba(255, 255, 255, 0.08)",
        borderRadius: "18px",
        transformOrigin: "50% 50%",
        scale: 1,
      });
      gsap.set(blackTransition, { opacity: 0 });
      gsap.set(backwhole, { opacity: 0, scale: 0.72 });
      const reducedBanners = section.querySelector<HTMLElement>(".story-banners");
      if (reducedBanners) reducedBanners.classList.add("banners-reduced");
      return;
    }

    const setText = (i: number) => () => {
      const el = els[i];
      if (el && el.textContent !== bubbles[i].text) {
        el.textContent = bubbles[i].text;
      }
    };

    const growText = (el: HTMLDivElement, text: string) => () => {
      if (el.textContent !== text) el.textContent = text;
    };

    let master: gsap.core.Timeline | null = null;
    const galleryLoaded = true;
    let io: IntersectionObserver | null = null;
    let glowAnim: gsap.core.Tween | null = null;
    let raf = 0;

    const startGalleryIfReady = () => {
      if (!galleryLoaded) return;
      gallery.dispatchEvent(new Event("dolly-gallery:start"));
    };

    const updateGalleryProgress = (progress: number) => {
      gallery.dispatchEvent(
        new CustomEvent("dolly-gallery:progress", { detail: { progress } }),
      );
    };

    const stopGallery = () => {
      gallery.dispatchEvent(new Event("dolly-gallery:stop"));
    };

    const build = () => {
      if (master) {
        master.scrollTrigger?.kill();
        master.kill();
        master = null;
      }
      if (io) {
        io.disconnect();
        io = null;
      }
      if (glowAnim) {
        glowAnim.scrollTrigger?.kill();
        glowAnim.kill();
        glowAnim = null;
      }
      gsap.set(box, { opacity: 1, scale: 1, y: 0, transformOrigin: "50% 50%" });
      gsap.set(camera, { scale: 1, y: 0, transformOrigin: "50% 18%" });
      if (storyFx) gsap.set(storyFx, { opacity: 0 });
      gsap.set(list, { y: 0, scale: 1 });
      gsap.set(els, { opacity: 0, y: 10, scale: 0.96 });
      gsap.set(cardEls, { opacity: 0, y: 10, scale: 0.96 });
      gsap.set(timeEls, { opacity: 0 });
      gsap.set(inputbar, {
        backgroundColor: "#121214",
        borderColor: "rgba(255, 255, 255, 0.08)",
        borderRadius: "18px",
        transformOrigin: "50% 50%",
        scale: 1,
      });
      gsap.set(blackTransition, {
        opacity: 0,
        top: "72%",
        left: "42%",
        width: "16%",
        height: "5%",
        borderRadius: "18px",
      });
      gsap.set(backwhole, { opacity: 0, scale: 0.72 });

      const isMobile = window.matchMedia("(max-width: 767px)").matches;

      // ----- Mobile: looping conversation + card takeover -----
      // No scroll-locking: the section flows naturally and this timeline plays
      // by itself while the section is on screen (pausing off-screen). The
      // phone acts out the full conversation, then fades away while the banner
      // cards replace each other in the phone's own spot; finally the phone
      // returns with the conversation reset and the loop repeats.
      if (isMobile) {
        stopGallery();
        if (storyFx) gsap.set(storyFx, { opacity: 1 });
        gsap.set(blackTransition, { opacity: 0 });
        gsap.set(backwhole, { opacity: 0, scale: 0.72 });

        const visualBox = section.querySelector<HTMLElement>(".story-visual-box");
        const banners = section.querySelector<HTMLElement>(".story-banners");
        const bannerImgs = banners
          ? Array.from(banners.querySelectorAll<HTMLElement>("img"))
          : [];
        gsap.set(bannerImgs, { opacity: 0, y: 0, scale: 1 });

        const descentEnd = () => Math.max(0, list.scrollHeight - body.clientHeight);
        const typeTime = (text: string) => text.length * 0.05;

        const resetConversation = () => {
          els.forEach((el) => {
            el.textContent = "";
            gsap.set(el, { opacity: 0, y: 10, scale: 0.96 });
          });
          cardEls.forEach((el) => gsap.set(el, { opacity: 0, y: 10, scale: 0.96 }));
          gsap.set(timeEls, { opacity: 0 });
          gsap.set(list, { y: 0, scale: 1 });
          if (barThumb) gsap.set(barThumb, { y: 0 });
        };

        const t = gsap.timeline({
          paused: true,
          repeat: -1,
          defaults: { ease: "power1.out" },
        });
        master = t;

        // ---- Act 1: the phone plays the full conversation ----
        // Customer asks to know more (typing).
        els[0].textContent = "";
        bubbles[0].text.split("").forEach((_, k) => {
          t.call(growText(els[0], bubbles[0].text.slice(0, k + 1)), [], 0.4 + k * 0.05);
        });
        t.to(els[0], { opacity: 1, y: 0, scale: 1, duration: 0.3 }, 0.4);
        t.to(timeEls[0], { opacity: 1, duration: 0.15 }, 0.4 + typeTime(bubbles[0].text) + 0.15);

        // Odyssey greets back.
        t.call(setText(1), [], 2.2);
        t.to(els[1], { opacity: 1, y: 0, scale: 1, duration: 0.32 }, 2.35);

        // Product cards arrive one by one, the view descends to follow.
        const cardTimes = [4.0, 5.6, 7.2, 8.8];
        const cardDepths = [0.18, 0.38, 0.6, 0.8];
        cardEls.forEach((el, i) => {
          const at = cardTimes[i];
          t.to(el, { opacity: 1, y: 0, scale: 1, duration: 0.3 }, at);
          t.to(list, { y: () => -descentEnd() * cardDepths[i], duration: 0.8, ease: "power1.inOut" }, at + 0.15);
          t.to(barThumb, { y: () => barTravel() * cardDepths[i], duration: 0.8, ease: "power1.inOut" }, at + 0.15);
        });

        // Customer asks for a custom package; Odyssey confirms.
        els[2].textContent = "";
        bubbles[2].text.split("").forEach((_, k) => {
          t.call(growText(els[2], bubbles[2].text.slice(0, k + 1)), [], 10.6 + k * 0.05);
        });
        t.to(els[2], { opacity: 1, y: 0, scale: 1, duration: 0.3 }, 10.6);
        t.to(timeEls[1], { opacity: 1, duration: 0.15 }, 10.6 + typeTime(bubbles[2].text) + 0.15);
        t.call(setText(3), [], 13.9);
        t.to(els[3], { opacity: 1, y: 0, scale: 1, duration: 0.32 }, 14.05);
        t.to(list, { y: () => -descentEnd(), duration: 0.8, ease: "power1.inOut" }, 14.2);
        t.to(barThumb, { y: () => barTravel(), duration: 0.8, ease: "power1.inOut" }, 14.2);

        if (visualBox && bannerImgs.length >= 2) {
          // ---- Act 2: phone fades, banners take over its exact spot ----
          t.to(visualBox, { opacity: 0, y: -20, scale: 0.98, ease: "power1.inOut", duration: 0.6 }, 16.9);
          t.fromTo(bannerImgs[0], { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, 17.1);
          for (let i = 1; i < bannerImgs.length; i++) {
            const outAt = 18.2 + (i - 1) * 2;
            t.to(bannerImgs[i - 1], { opacity: 0, y: -14, duration: 0.4, ease: "power1.in" }, outAt);
            t.fromTo(bannerImgs[i], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, outAt + 0.2);
          }
          t.to(bannerImgs[3], { opacity: 0, y: -14, duration: 0.45, ease: "power1.in" }, 24.2);

          // ---- Act 3: phone returns, conversation resets, loop ----
          t.call(resetConversation, [], 24.6);
          t.to(visualBox, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power2.out" }, 24.8);
        }

        io = new IntersectionObserver(
          (entries) => {
            if (entries[0]?.isIntersecting) t.play();
            else t.pause();
          },
          { rootMargin: "0px 0px -10% 0px" },
        );
        io.observe(section);
        return;
      }

      // ----- Desktop: scroll-scrubbed sequence -----
      // Zoom target: the center of the inputbar field, relative to the phone
      // box. The final transition dives INTO the field instead of expanding it.
      const boxRect = box.getBoundingClientRect();
      const fieldRect = inputbar.getBoundingClientRect();
      const originX =
        ((fieldRect.left + fieldRect.width / 2 - boxRect.left) / boxRect.width) * 100;
      const originY =
        ((fieldRect.top + fieldRect.height / 2 - boxRect.top) / boxRect.height) * 100;

      // Desktop descends to the bottom of the chat as the story plays out.
      const descentEnd = 0.9;
      const descentRange = Math.max(0, list.scrollHeight - body.clientHeight);

      const t = gsap.timeline({
        defaults: { ease: "power1.out" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
          onUpdate: (self) => {
            const backwholeVisible = Number(gsap.getProperty(backwhole, "opacity")) > 0.01;
            if (backwholeVisible) {
              startGalleryIfReady();
              const galleryInput = gsap.utils.clamp(0, 1, (self.progress - 0.78) / 0.22);
              updateGalleryProgress(Math.pow(galleryInput, 1.5));
            } else {
              stopGallery();
            }

            const descentStart = 0.2;
            const descentProgress = gsap.utils.clamp(
              0,
              1,
              (self.progress - descentStart) / (descentEnd - descentStart)
            );
            gsap.set(list, { y: -descentRange * descentProgress });
            if (barThumb) gsap.set(barThumb, { y: barTravel() * descentProgress });

            const headlineEl = captionRef.current?.querySelector<HTMLElement>("[data-story-headline]");
            if (!headlineEl) return;
            const next = self.progress > 0.84 ? headline2 : headline1;
            if (headlineEl.dataset.state !== next) {
              headlineEl.innerHTML = next;
              headlineEl.dataset.state = next;
            }
          },
        },
      });
      master = t;

      if (storyFx) {
        t.to(storyFx, { opacity: 1, duration: 0.38, ease: "power2.out" }, 0.1);
      }

      t.to(camera, { scale: 1.42, y: 28, duration: 0.1, ease: "power2.out" }, 0.08)
        .to(camera, { scale: 1.42, y: 28, duration: 0.08 }, 0.18)
        .to(camera, { scale: 1.42, y: -12, duration: 0.7, ease: "none" }, 0.2)
          .set(box, { zIndex: 8, transformOrigin: `${originX}% ${originY}%` }, 0.9)
        .to(inputbar, {
          backgroundColor: "#000000",
          borderColor: "rgba(0, 0, 0, 0)",
          borderRadius: "0px",
          scale: 2.7,
          duration: 0.18,
          ease: "power2.in",
        }, 0.9)
        .to(box, {
          scale: 18,
          duration: 0.18,
          ease: "power2.in",
        }, 0.9)
        .to(blackTransition, {
          opacity: 1,
          top: "0%",
          left: "0%",
          width: "100%",
          height: "100%",
          borderRadius: "0px",
          duration: 0.2,
          ease: "power2.in",
        }, 0.92)
        .to(camera, { scale: 1, y: 0, duration: 0.2, ease: "power2.out" }, 0.92)
        .set(box, { zIndex: 2, scale: 1 }, 1.12)
        .to(backwhole, { opacity: 1, scale: 1, duration: 0.22, ease: "power2.out" }, 1.12);

      const bubblePositions: Array<[number, string]> = [
        [0.02, "type"],
        [0.12, "reveal"],
        [0.62, "type"],
        [1.14, "reveal"],
      ];
      let outgoingTimeIndex = 0;

      bubblePositions.forEach(([pos, mode], i) => {
        const el = els[i];
        if (!el) return;
        if (mode === "type") {
          const chars = bubbles[i].text.split("");
          chars.forEach((_, k) => {
            t.call(growText(el, bubbles[i].text.slice(0, k + 1)), [], pos + k * 0.007);
          });
          t.to(el, { opacity: 1, y: 0, scale: 1, duration: 0.26 }, pos + 0.04);
          const timeEl = timeEls[outgoingTimeIndex++];
          if (timeEl) {
            t.to(timeEl, { opacity: 1, duration: 0.12 }, pos + chars.length * 0.007 + 0.06);
          }
        } else {
          t.call(setText(i), [], pos);
          t.to(el, { opacity: 1, y: 0, scale: 1, duration: 0.22 }, pos + 0.03);
        }
      });

      // Product cards arrive one by one, pushing the view down.
      const cardPositions = [0.22, 0.32, 0.42, 0.52];
      cardEls.forEach((el, i) => {
        t.to(el, { opacity: 1, y: 0, scale: 1, duration: 0.24 }, cardPositions[i] + 0.03);
      });

      // The hero's atmospheric glow drifts with the scroll (see AtmosphereBackground),
      // so the backwhole glow does the same here — it keeps moving as the
      // camera scrubs through the pinned sequence.
      const glow = backwhole.querySelector<HTMLElement>(".story-bg-glow");
      if (glow) {
        glowAnim = gsap.to(glow, {
          y: 340,
          x: -120,
          scale: 1.3,
          opacity: 0.1,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
          },
        });
      }

      if (galleryLoaded && Number(gsap.getProperty(backwhole, "opacity")) > 0.01) {
        startGalleryIfReady();
      }
    };

    build();
    // Track the current layout branch so resize handling can tell real layout
    // changes (mobile <-> desktop) apart from spurious mobile resize events.
    let lastIsMobile = window.matchMedia("(max-width: 767px)").matches;

    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const isMobile = window.matchMedia("(max-width: 767px)").matches;
        // On physical phones, touch/scroll interactions collapse or expand the
        // browser chrome (URL bar), which fires `resize` events. Rebuilding on
        // those would kill and recreate the mobile loop timeline, restarting
        // the conversation. The mobile loop reads live measurements, so it
        // only needs a rebuild when the layout branch actually changes.
        if (isMobile && isMobile === lastIsMobile) return;
        lastIsMobile = isMobile;
        build();
      });
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      if (io) io.disconnect();
      glowAnim?.scrollTrigger?.kill();
      glowAnim?.kill();
      master?.scrollTrigger?.kill();
      master?.kill();
    };
    // Refs are stable and `bubbles`/`products` are recreated arrays of those
    // same refs; rebuilding on every render would thrash the timeline. Only
    // the reduced preference and headline copy (locale) should re-trigger it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, headline1, headline2]);
}