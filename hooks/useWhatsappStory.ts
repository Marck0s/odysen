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
  theme: "light" | "dark";
}

/**
 * Tinker-style pinned phone with a live conversation:
 * - Desktop: ONE initial zoom into the upper portion of the phone (focusing the
 *   first message), then the zoom stays CONSTANT while the camera travels
 *   vertically through the conversation as messages and product cards arrive,
 *   and finally dives into the inputbar to reveal the gallery — all scrubbed
 *   to scroll. The device stays fixed (sticky) while the page scrolls.
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
  theme,
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
    const caret = inputbar.querySelector<HTMLElement>(".inputbar-caret");
    const storyFx = camera.querySelector<HTMLElement>('.floating-lines-container');
    // In dark mode the zoomed inputbar itself becomes the full-screen backdrop
    // (the "screen"), so the separate black-transition and backwhole screens
    // are skipped entirely — only the cards appear on top of the inputbar.
    const isDark = theme === "dark";

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
      gsap.set(backwhole, { opacity: 0, scale: 0.06 });
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
      // Dark mode: the zoomed inputbar is the screen. The phone chrome is
      // hidden only while the zoomed field actually covers the viewport —
      // computed live in the driver below so forward and reverse scroll stay
      // in sync (the reverse fast un-zoom never reveals a black phone).
      const phoneUI = isDark
        ? box.querySelectorAll<HTMLElement>(
            ".cell-mold, .phone-statusbar, .phone-topbar, .phone-body, .phone-homebar, .inputbar-btn",
          )
        : null;
      const cellScreen = isDark ? box.querySelector<HTMLElement>(".cell-screen") : null;
      if (phoneUI) gsap.set(phoneUI, { opacity: 1 });
      if (cellScreen) {
        gsap.set(cellScreen, { clearProps: "backgroundImage,backgroundColor" });
      }
      gsap.set(box, { opacity: 1, scale: 1, y: 0, transformOrigin: "50% 50%" });
      // The phone shadow lives on .story-visual-box (the parent), so the parent
      // must be reset alongside the phone itself — otherwise the shadow stays
      // visible after the phone is hidden and bleeds into the next section.
      if (box.parentElement) gsap.set(box.parentElement, { opacity: 1 });
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
        y: 0,
      });
      if (caret) gsap.set(caret, { visibility: "visible" });

      // Desktop camera choreography (the mobile branch ignores these values).
      // Tinker-style: ONE initial zoom into the upper portion of the phone,
      // then the zoom stays CONSTANT while the camera travels vertically
      // through the phone as the user scrolls. The phone is centered in the
      // 100vh camera; at CAMERA_ZOOM with the transform-origin at 50% 18% the
      // phone's bottom edge lands below the viewport, so `travelY` is the
      // distance the camera must move up to bring the lower portion of the
      // phone (the inputbar) into view at the end of the section.
      const CAMERA_ZOOM = 1.42;
      const vh = window.innerHeight;
      const boxRect = box.getBoundingClientRect();
      const fieldRect = inputbar.getBoundingClientRect();
      const phoneHeight = boxRect.height;
      const phoneTop = (vh - phoneHeight) / 2;
      const cameraOriginY = vh * 0.18;
      const travelY = Math.max(
        0,
        cameraOriginY + (phoneTop + phoneHeight - cameraOriginY) * CAMERA_ZOOM - vh,
      );
      // The black "screen" that closes in during the dive grows from the
      // inputbar's position. Because the camera is scaled, the black
      // transition's top must be set to the inputbar's camera-space coord so
      // the camera transform maps it onto the inputbar's on-screen position.
      const inputbarCenterOffset = fieldRect.top + fieldRect.height / 2 - boxRect.top;
      const inputbarCameraCoord = phoneTop + inputbarCenterOffset;
      const blackTransitionTop = (inputbarCameraCoord / vh) * 100;

      gsap.set(blackTransition, {
        opacity: 0,
        top: `${blackTransitionTop}%`,
        left: "42%",
        width: "16%",
        height: "5%",
        borderRadius: "18px",
      });
      gsap.set(backwhole, { opacity: 0, scale: 0.06, borderRadius: "32px" });

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
        gsap.set(backwhole, { opacity: 0, scale: 0.06 });

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
          // Keep the last banner on screen until the phone starts returning so
          // there is never a frame where every banner is transparent and the
          // white page background shows through the banner container.
          t.to(bannerImgs[3], { opacity: 0, y: -14, duration: 0.45, ease: "power1.in" }, 24.8);

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
      // (boxRect/fieldRect are measured above, before the mobile branch.)
      const originX =
        ((fieldRect.left + fieldRect.width / 2 - boxRect.left) / boxRect.width) * 100;
      const originY =
        ((fieldRect.top + fieldRect.height / 2 - boxRect.top) / boxRect.height) * 100;

      // Dark mode: the inputbar zoom IS the screen, so it must zoom far enough
      // to cover the whole viewport at the peak box zoom (18x) — otherwise the
      // phone chrome around it would peek through the edges. Light mode keeps
      // the fixed 2.7x dive (the black transition covers the rest).
      let inputbarScale = 2.7;
      let diveCoverage = 0;
      if (isDark) {
        const centerOffset = fieldRect.top + fieldRect.height / 2 - vh / 2;
        diveCoverage = vh + 2 * Math.abs(centerOffset);
        inputbarScale = Math.max(2.7, (diveCoverage / (fieldRect.height * 18)) * 1.12);
      }

      // Desktop descends to the bottom of the chat as the story plays out.
      const descentEnd = 0.9;
      const descentRange = Math.max(0, list.scrollHeight - body.clientHeight);

      // Gallery reveal: the backdrop (rounded screen) arrives first, then the
      // cards fade in on top of it. The card animation is scrubbed over the
      // same scroll window so the cards start moving exactly when they become
      // visible — never mid-motion.
      const galleryFadeStart = 1.39;
      const galleryFadeEnd = 1.61;
      const galleryRevealStart = galleryFadeStart / galleryFadeEnd;

      const t = gsap.timeline({
        defaults: { ease: "power1.out" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
          onUpdate: (self) => {
            // The gallery runs exactly while it is visible. Its opacity is
            // driven by the scrubbed main timeline (the autoAlpha fade at
            // galleryFadeStart), so this stays true in BOTH directions for the
            // whole visible window. The old check (backwhole opacity in light
            // mode / box scale in dark mode) flipped false on reverse scroll
            // while the gallery was still on screen — e.g. the box un-zooms
            // fast on reverse, so box.scale dropped below 1.5 within a few
            // frames and stopGallery() reset the cards to 0 mid-view, making
            // the reverse "jump" straight to the input state.
            const backdropVisible = Number(gsap.getProperty(gallery, "opacity")) > 0.01;
            if (backdropVisible) {
              startGalleryIfReady();
              const galleryInput = gsap.utils.clamp(
                0,
                1,
                (self.progress - galleryRevealStart) / (1 - galleryRevealStart)
              );
              updateGalleryProgress(Math.pow(galleryInput, 1.5));
            } else {
              stopGallery();
            }

            // The chat list starts descending as soon as the camera's vertical
            // travel begins (the camera zoom is already locked by then).
            const descentStart = 0.16;
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
      // The box scale is driven here (not by a timeline tween) so the dive can
      // be asymmetric without snapping: forward it follows the exact power3.in
      // curve; backward it un-zooms faster (scaled) so the phone is at a low
      // scale when the black opens — no giant phone/inputbar revealed through
      // the fading black. The timeline's own onUpdate fires on every render
      // (unlike ScrollTrigger's onUpdate, which only fires when the raw scroll
      // progress changes), so the scale stays locked to the timeline time in
      // both directions. `recovering` eases back to the exact curve when the
      // user scrolls forward again right after a backward pass (no snap).
      let lastTime = 0;
      let displayScale = 1;
      let recovering = false;
      let chromeHidden = false;
      t.eventCallback("onUpdate", () => {
        const now = t.time();
        const goingBack = now < lastTime;
        lastTime = now;
        const diveProgress = gsap.utils.clamp(0, 1, (now - 0.95) / 0.18);
        const diveScale = now >= 0.95 ? 1 + 17 * Math.pow(diveProgress, 4) : 1;

        if (goingBack) {
          recovering = true;
          // Un-zoom to near-natural scale fast (behind the opaque screen), so
          // when the screen opens the phone is at ~1x — never a giant box.
          const target = 1 + (diveScale - 1) * 0.02;
          displayScale += (target - displayScale) * 0.5;
        } else {
          if (recovering && Math.abs(diveScale - displayScale) > 0.5) {
            displayScale += (diveScale - displayScale) * 0.4;
          } else {
            recovering = false;
            displayScale = diveScale;
          }
        }
        gsap.set(box, { scale: displayScale });

        // Dark mode: hide the phone chrome only while the zoomed inputbar
        // covers the viewport. Tied to the live box scale (not a fixed
        // timeline position) so the reverse scroll — where the box un-zooms
        // fast — un-hides the phone in sync instead of leaving a black
        // rectangle behind.
        if (isDark && phoneUI) {
          const inputbarScaleNow = 1 + (inputbarScale - 1) * Math.pow(diveProgress, 4);
          const coversViewport =
            fieldRect.height * inputbarScaleNow * displayScale >= diveCoverage;
          if (coversViewport !== chromeHidden) {
            chromeHidden = coversViewport;
            gsap.set(phoneUI, { opacity: coversViewport ? 0 : 1 });
            if (cellScreen) {
              if (coversViewport) {
                gsap.set(cellScreen, { backgroundImage: "none", backgroundColor: "#07060b" });
              } else {
                gsap.set(cellScreen, { clearProps: "backgroundImage,backgroundColor" });
              }
            }
          }
        }
      });
      master = t;

      if (storyFx) {
        t.to(storyFx, { opacity: 1, duration: 0.38, ease: "power2.out" }, 0.1);
      }

      // Camera choreography (Tinker-style): ONE initial zoom into the upper
      // portion of the phone (0.00–0.16), then the zoom stays CONSTANT while
      // the camera travels vertically through the phone (0.16–0.90) as the
      // conversation descends toward the inputbar — the climax. The dive into
      // the inputbar follows at 0.95+, then the camera pulls back to the
      // gallery. `travelY` is computed above so the phone's bottom edge lands
      // exactly at the viewport bottom at the end of the travel.
      t.to(camera, { scale: CAMERA_ZOOM, y: 0, duration: 0.16, ease: "power2.inOut" }, 0.0)
        .to(camera, { scale: CAMERA_ZOOM, y: -travelY, duration: 0.74, ease: "power1.inOut" }, 0.16)
        .set(box, { zIndex: 8, transformOrigin: `${originX}% ${originY}%` }, 0.95)
        // Hide the blinking caret before the dive: it would otherwise scale
        // with the inputbar into a giant white bar inside the black field.
        // `visibility` (not opacity) is used because the caret's CSS animation
        // `caretBlink` animates opacity and would override an inline GSAP
        // opacity; visibility is not animated by it, so the scrub can revert
        // the set cleanly when scrolling back.
        .set(caret, { visibility: "hidden" }, 0.95)
        // Darken the field first (fast), THEN expand it — so the expansion
        // grows out of an already-black field instead of a light rectangle
        // that turns black mid-grow. The field also lifts out of the phone
        // (y: -8) as it grows, so it reads as "leaving" the device toward the
        // camera; the power4.in ease makes the dive accelerate into the
        // screen-fill (matched by the driver's pow(..., 4) curves).
        .to(inputbar, {
          backgroundColor: "#07060b",
          borderColor: "rgba(0, 0, 0, 0)",
          borderRadius: "0px",
          duration: 0.08,
          ease: "power1.in",
        }, 0.95)
        .to(inputbar, {
          scale: inputbarScale,
          y: -8,
          duration: 0.18,
          ease: "power4.in",
        }, 0.95)
        // The cards fade in only after the screen has fully arrived, so the
        // screen comes first and the cards follow on top of it.
        .to(gallery, { autoAlpha: 1, duration: 0.22, ease: "power2.out" }, galleryFadeStart);

      if (isDark) {
        // Dark mode: the zoomed inputbar IS the screen. The phone chrome is
        // hidden by the driver (tied to the live box scale), so the phone
        // stays fully visible while the inputbar zooms over it. The camera
        // dives in as the inputbar grows (the "zoom into the input"), then
        // pulls back once the screen is fully established. Once the cards
        // are fully in, drop the phone entirely so its huge 18x bounds can't
        // bleed into the next section — the cards float over the dark page
        // background from here on (same color as the inputbar).
        t.to(camera, { scale: 1.55, y: -travelY, duration: 0.18, ease: "power2.in" }, 0.95)
          .to(camera, { scale: 1, y: 0, duration: 0.22, ease: "power2.inOut" }, 1.13)
          .set(box.parentElement, { opacity: 0 }, galleryFadeEnd + 0.05);
      } else {
        // Light mode: the black closes in as the dive completes, so the screen
        // is fully dark before the camera pull-back and box reset — the phone
        // can never reappear.
        t.to(blackTransition, {
          opacity: 1,
          top: "0%",
          left: "0%",
          width: "100%",
          height: "100%",
          borderRadius: "0px",
          boxShadow: "0 0 90px 30px rgba(114, 56, 240, 0.45)",
          duration: 0.2,
          ease: "power3.in",
        }, 0.95)
          // Camera pulls back behind the opaque black (ends at 1.17), THEN the
          // box is hidden/reset and the gallery fades in at camera scale 1 — so
          // the cards never appear zoomed.
          .to(camera, { scale: 1, y: 0, duration: 0.2, ease: "power2.out" }, 0.97)
          .set(box, { opacity: 0, zIndex: 2 }, 1.17)
          // Hide the parent too: the phone shadow is a pseudo-element of
          // .story-visual-box, so it would otherwise stay visible at the top of
          // the viewport while the camera scrolls away into the next section.
          .set(box.parentElement, { opacity: 0 }, 1.17)
          // The gallery screen grows from a small rounded rectangle to fill the
          // viewport; as it reaches full screen the corners straighten out so
          // the full-bleed backdrop has sharp edges (no dark corner gaps).
          .to(backwhole, { opacity: 1, duration: 0.06, ease: "power1.out" }, 1.17)
          .to(backwhole, { scale: 1, duration: 0.22, ease: "power2.inOut" }, 1.17)
          .to(backwhole, { borderRadius: "0px", duration: 0.09, ease: "power1.in" }, 1.30);
      }

      // Human-like typing: variable speed with a short pause after punctuation.
      const typeSchedule = (el: HTMLDivElement, text: string, startAt: number) => {
        const calls: Array<[number, () => void]> = [];
        let at = startAt;
        for (let k = 0; k < text.length; k++) {
          const ch = text[k];
          calls.push([at, growText(el, text.slice(0, k + 1))]);
          at += 0.004 + (k % 3) * 0.0015;
          if (ch === "." || ch === "!" || ch === "?") at += 0.1;
        }
        return { calls, end: at };
      };

      const bubblePositions: Array<[number, string]> = [
        [0.02, "type"],
        [0.12, "reveal"],
        [0.55, "type"],
        [0.85, "reveal"],
      ];
      let outgoingTimeIndex = 0;

      bubblePositions.forEach(([pos, mode], i) => {
        const el = els[i];
        if (!el) return;
        if (mode === "type") {
          const { calls, end } = typeSchedule(el, bubbles[i].text, pos);
          calls.forEach(([at, fn]) => t.call(fn, [], at));
          // Springy entrance: overshoot on scale, then settle.
          t.fromTo(
            el,
            { opacity: 0, y: 10, scale: 0.9 },
            { opacity: 1, y: 0, scale: 1.06, duration: 0.2, ease: "power2.out" },
            pos + 0.04,
          );
          t.to(el, { scale: 1, duration: 0.14, ease: "power1.out" }, pos + 0.24);
          const timeEl = timeEls[outgoingTimeIndex++];
          if (timeEl) {
            t.to(timeEl, { opacity: 1, duration: 0.12 }, end + 0.06);
          }
        } else {
          t.call(setText(i), [], pos);
          t.fromTo(
            el,
            { opacity: 0, y: 10, scale: 0.9 },
            { opacity: 1, y: 0, scale: 1.06, duration: 0.18, ease: "power2.out" },
            pos + 0.03,
          );
          t.to(el, { scale: 1, duration: 0.12, ease: "power1.out" }, pos + 0.21);
        }
      });

      // Product cards arrive one by one with a springy entrance, pushing the
      // view down.
      const cardPositions = [0.22, 0.32, 0.42, 0.52];
      cardEls.forEach((el, i) => {
        t.fromTo(
          el,
          { opacity: 0, y: 12, scale: 0.92 },
          { opacity: 1, y: 0, scale: 1.04, duration: 0.22, ease: "power2.out" },
          cardPositions[i] + 0.03,
        );
        t.to(el, { scale: 1, duration: 0.12, ease: "power1.out" }, cardPositions[i] + 0.25);
      });

      // The hero's atmospheric glow drifts with the scroll (see AtmosphereBackground),
      // so the backwhole glow does the same here — it keeps moving as the
      // camera scrubs through the pinned sequence. Dark mode skips it: the
      // backwhole never appears there (the inputbar is the screen).
      const glow = backwhole.querySelector<HTMLElement>(".story-bg-glow");
      if (glow && !isDark) {
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

      // The gallery is active exactly while it is visible (its opacity is driven
      // by the scrubbed timeline), so a rebuild mid-scroll resumes it in sync.
      const backdropVisible = Number(gsap.getProperty(gallery, "opacity")) > 0.01;
      if (galleryLoaded && backdropVisible) {
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
    // the reduced preference, headline copy (locale), and theme should
    // re-trigger it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, headline1, headline2, theme]);
}