"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { gsap } from "@/lib/gsap";

type DollyImage = string | { src: string; alt?: string };

interface DollyGalleryProps {
  images: DollyImage[];
  infinite?: boolean;
  itemWidth?: number;
  aspectRatio?: number;
  borderRadius?: number;
  grayscale?: number;
  perspective?: number;
  spacing?: number;
  spread?: number;
  scatter?: number;
  revealRange?: number;
  passRange?: number;
  parallaxX?: number;
  parallaxY?: number;
  parallaxSmooth?: number;
  tilt?: number;
  pulse?: number;
  drift?: number;
  smooth?: number;
  wheelSpeed?: number;
  dragSpeed?: number;
  autoScroll?: number;
  pauseOnHover?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const DollyGallery = forwardRef<HTMLDivElement, DollyGalleryProps>(function DollyGallery(
  {
    images,
    infinite = false,
    itemWidth = 340,
    aspectRatio = 0.8,
    borderRadius = 7,
    grayscale = 1,
    perspective = 1000,
    spacing = 800,
    spread = 0.8,
    scatter = 0.1,
    tilt = 4,
    pulse = 0.03,
    drift = 0.08,
    smooth = 0.85,
    wheelSpeed = 1,
    dragSpeed = 1.5,
    autoScroll = 20,
    pauseOnHover = false,
    className = "",
    children,
  },
  forwardedRef,
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useImperativeHandle(forwardedRef, () => rootRef.current as HTMLDivElement, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-dolly-card]"));
    const moveTimeline = gsap.timeline({ paused: true, repeat: infinite ? -1 : 0 });
    timelineRef.current = moveTimeline;
    let running = false;

    cards.forEach((card, index) => {
      const direction = index % 2 === 0 ? -1 : 1;
      moveTimeline
        .fromTo(
          card,
          {
            autoAlpha: 0,
            xPercent: direction * -spread * 100,
            yPercent: direction * scatter * 100,
            z: -spacing,
            scale: 0.36,
            rotationY: direction * -tilt,
          },
          {
            autoAlpha: 1,
            xPercent: 0,
            yPercent: 0,
            z: 0,
            scale: 1,
            rotationY: 0,
            duration: 1.1,
            ease: "power2.out",
          },
        )
        .to(card, {
          autoAlpha: 0,
          xPercent: direction * spread * 100,
          yPercent: direction * -scatter * 100,
          z: spacing * 0.4,
          scale: 1 + pulse,
          rotationY: direction * tilt,
          duration: 1.1,
          ease: "power2.in",
        });
    });

    const start = () => {
      if (running) return;
      running = true;
      // Resume from the current progress — never reset to 0. Resetting here
      // made the cards restart from the beginning on re-entry (e.g. after a
      // reverse scroll past the gallery), which felt like a jump instead of a
      // smooth resume. The next progress event drives the timeline to the
      // scroll-matched position.
    };
    const updateProgress = (event: Event) => {
      const progress = (event as CustomEvent<{ progress: number }>).detail.progress;
      if (!running) return;
      const target = Math.max(0, Math.min(1, progress));
      const current = moveTimeline.progress();
      // Forward keeps the long, weighted glide (the intended feel). Reverse
      // tracks the scroll closely so the cards retrace their exact states
      // instead of lagging behind and being cut off mid-reverse.
      const duration = target < current ? 0.4 : Math.max(1.1, smooth * 1.6);
      gsap.to(moveTimeline, {
        progress: target,
        duration,
        ease: "power1.out",
        overwrite: true,
      });
    };
    const stop = () => {
      if (!running) return;
      running = false;
      // Leave the timeline where it is. Visibility is driven by the story
      // timeline (the scrubbed autoAlpha fade), and resetting to 0 here made
      // the cards jump to their initial state on reverse scroll while the
      // gallery was still on screen.
    };

    root.addEventListener("dolly-gallery:start", start);
    root.addEventListener("dolly-gallery:progress", updateProgress);
    root.addEventListener("dolly-gallery:stop", stop);
    gsap.set(root, { autoAlpha: 0, perspective, transformPerspective: perspective });
    gsap.set(cards, {
      width: `min(${itemWidth}px, 72vw)`,
      aspectRatio: `${aspectRatio}`,
      borderRadius,
      filter: `grayscale(${grayscale})`,
      transformOrigin: "50% 50%",
      transformStyle: "preserve-3d",
      backfaceVisibility: "hidden",
      willChange: "transform, opacity",
    });

    return () => {
      root.removeEventListener("dolly-gallery:start", start);
      root.removeEventListener("dolly-gallery:progress", updateProgress);
      root.removeEventListener("dolly-gallery:stop", stop);
      moveTimeline.kill();
      timelineRef.current = null;
    };
  }, [aspectRatio, borderRadius, grayscale, infinite, itemWidth, perspective, scatter, smooth, spacing, spread, tilt, pulse]);

  return (
    <div
      ref={rootRef}
      className={`dolly-gallery ${className}`}
      data-smooth={smooth}
      data-wheel-speed={wheelSpeed}
      data-drag-speed={dragSpeed}
      data-drift={drift}
      data-auto-scroll={autoScroll}
      data-pause-on-hover={pauseOnHover}
    >
      {images.map((image, index) => {
        const source = typeof image === "string" ? image : image.src;
        const alt = typeof image === "string" ? "" : image.alt || "";
        return <img key={`${source}-${index}`} data-dolly-card src={source} alt={alt} draggable={false} />;
      })}
      {children}
    </div>
  );
});

export default DollyGallery;
