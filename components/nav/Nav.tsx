"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useMagnetic } from "@/hooks/useMagnetic";
import LangToggle from "@/components/ui/LangToggle";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function Nav() {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const navInnerRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  useMagnetic(ctaRef as React.RefObject<HTMLElement>, 0.2);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      gsap.fromTo(".mobile-menu", { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
    }
  }, [menuOpen]);

  // Compact group at the top -> separated (gum-like, scrubbed) when the phone story pins
  useLayoutEffect(() => {
    const navInner = navInnerRef.current;
    const left = leftRef.current;
    const right = rightRef.current;
    if (!navInner || !left || !right) return;

    let tl: gsap.core.Timeline | null = null;
    let tl2: gsap.core.Timeline | null = null;
    let raf = 0;

    const build = () => {
      if (tl) {
        tl.scrollTrigger?.kill();
        tl.kill();
      }
      if (tl2) {
        tl2.scrollTrigger?.kill();
        tl2.kill();
      }

      const cs = getComputedStyle(navInner);
      const padL = parseFloat(cs.paddingLeft) || 0;
      const padR = parseFloat(cs.paddingRight) || 0;
      const contentW = navInner.clientWidth - padL - padR;
      const L = left.offsetWidth;
      const R = right.offsetWidth;
      const GAP = contentW < 500 ? 16 : 24;
      const togetherLeft = (contentW - L - R - GAP) / 2;
      const togetherRight = togetherLeft + L + GAP;
      // Natural flex position of the right group (accounts for overflow when
      // the groups are wider than the container).
      const naturalRight = Math.max(contentW - R, L + GAP);

      gsap.set(left, { x: togetherLeft });
      gsap.set(right, { x: togetherRight - naturalRight });

      // Mobile keeps the groups joined (gum together) at all times — the
      // scroll-driven separation is a desktop-only effect.
      if (window.matchMedia("(max-width: 767px)").matches) return;

      tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: ".story",
          start: "top top",
          end: "+=300",
          scrub: true,
        },
      });
      tl.to(left, { x: 0 }, 0)
        .to(right, { x: 0 }, 0);

      // The websites section comes in separated; only join the groups again
      // at the middle of it, then stay joined from there on.
      tl2 = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: "#websites",
          start: "center center",
          end: "+=300",
          scrub: true,
        },
      });
      tl2
        .to(left, { x: togetherLeft }, 0)
        .to(right, { x: togetherRight - naturalRight }, 0);
    };

    // Rebuild whenever the nav layout changes (fonts loading, resize, etc.)
    const scheduleBuild = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(build);
    };
    const ro = new ResizeObserver(scheduleBuild);
    ro.observe(navInner);
    ro.observe(left);
    ro.observe(right);

    build();

    const refresh = () => {
      build();
      ScrollTrigger.refresh();
    };
    const onLoad = () => refresh();
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad);

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (navInner.isConnected) refresh();
      });
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("load", onLoad);
      if (tl) {
        tl.scrollTrigger?.kill();
        tl.kill();
      }
      if (tl2) {
        tl2.scrollTrigger?.kill();
        tl2.kill();
      }
    };
  }, []);

  const links: Array<[string, string]> = [
    ["#servicos", "nav.services"],
    ["#portfolio", "nav.work"],
    ["#sobre", "nav.about"],
    ["#contato", "nav.contact"],
  ];

  return (
    <header className={`nav${scrolled ? " scrolled" : ""}`}>
      <div className="container nav-inner" ref={navInnerRef}>
        <div className="nav-left" ref={leftRef}>
          <a href="#top" className="logo">
            <img src="/assets/odysen-logo/odysen-vertical-logo.png" alt="Odysen" className="logo-mark" />
          </a>
          <LangToggle />
        </div>

        <div className="nav-right" ref={rightRef}>
          <ThemeToggle />
          <a href="#contato" className="btn btn-primary" ref={ctaRef}>
            <span>{t("nav.cta")}</span>
            <span className="arrow">→</span>
          </a>
          <button
            className="menu-toggle"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            ☰
          </button>

          {menuOpen && (
            <div className="mobile-menu">
              {links.map(([href, key]) => (
                <a key={key} href={href} onClick={() => setMenuOpen(false)}>
                  {t(key)}
                </a>
              ))}
              <div className="mobile-lang">
                <LangToggle />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}