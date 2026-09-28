"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useMagnetic } from "@/hooks/useMagnetic";
import LangToggle from "@/components/ui/LangToggle";
import ThemeToggle from "@/components/ui/ThemeToggle";

type ModelKey = "chatgpt" | "claude" | "google";

/**
 * ChatGPT / Claude / Google marks — the exact paths already used by the Footer's
 * AI row, so the menu entry point and the footer read as the same feature.
 * Duplicated on purpose: the Footer is out of scope for this change. Follow-up:
 * lift both the icons and the model list into a shared `lib/ai.ts`.
 */
const AI_ICONS: Record<ModelKey, { viewBox: string; d: string }> = {
  chatgpt: {
    viewBox: "0 0 24 24",
    d: "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z",
  },
  claude: {
    viewBox: "0 0 100 100",
    d: "m19.6 66.5 19.7-11 .3-1-.3-.5h-1l-3.3-.2-11.2-.3L14 53l-9.5-.5-2.4-.5L0 49l.2-1.5 2-1.3 2.9.2 6.3.5 9.5.6 6.9.4L38 49.1h1.6l.2-.7-.5-.4-.4-.4L29 41l-10.6-7-5.6-4.1-3-2-1.5-2-.6-4.2 2.7-3 3.7.3.9.2 3.7 2.9 8 6.1L37 36l1.5 1.2.6-.4.1-.3-.7-1.1L33 25l-6-10.4-2.7-4.3-.7-2.6c-.3-1-.4-2-.4-3l3-4.2L28 0l4.2.6L33.8 2l2.6 6 4.1 9.3L47 29.9l2 3.8 1 3.4.3 1h.7v-.5l.5-7.2 1-8.7 1-11.2.3-3.2 1.6-3.8 3-2L61 2.6l2 2.9-.3 1.8-1.1 7.7L59 27.1l-1.5 8.2h.9l1-1.1 4.1-5.4 6.9-8.6 3-3.5L77 13l2.3-1.8h4.3l3.1 4.7-1.4 4.9-4.4 5.6-3.7 4.7-5.3 7.1-3.2 5.7.3.4h.7l12-2.6 6.4-1.1 7.6-1.3 3.5 1.6.4 1.6-1.4 3.4-8.2 2-9.6 2-14.3 3.3-.2.1.2.3 6.4.6 2.8.2h6.8l12.6 1 3.3 2 1.9 2.7-.3 2-5.1 2.6-6.8-1.6-16-3.8-5.4-1.3h-.8v.4l4.6 4.5 8.3 7.5L89 80.1l.5 2.4-1.3 2-1.4-.2-9.2-7-3.6-3-8-6.8h-.5v.7l1.8 2.7 9.8 14.7.5 4.5-.7 1.4-2.6 1-2.7-.6-5.8-8-6-9-4.7-8.2-.5.4-2.9 30.2-1.3 1.5-3 1.2-2.5-2-1.4-3 1.4-6.2 1.6-8 1.3-6.4 1.2-7.9.7-2.6v-.2H49L43 72l-9 12.3-7.2 7.6-1.7.7-3-1.5.3-2.8L24 86l10-12.8 6-7.9 4-4.6-.1-.5h-.3L17.2 77.4l-4.7.6-2-2 .2-3 1-1 8-5.5Z",
  },
  google: {
    viewBox: "0 0 24 24",
    d: "M12 2a10 10 0 1 0 10 10 10 10 0 0 0-10-10zm5.2 14.2A6.5 6.5 0 0 1 12 18.5a6.5 6.5 0 1 1 5.2-10.6l-2.1 1.8a3.7 3.7 0 0 0-3.1-1.7 3.8 3.8 0 1 0 0 7.6 3.4 3.4 0 0 0 3.6-2.8H12v-2.4h6.4a6.4 6.4 0 0 1-1.2 3.8z",
  },
};

export default function Nav() {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const navInnerRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  useMagnetic(ctaRef as React.RefObject<HTMLElement>, 0.2);

  // Hover-driven menu (desktop): opens on mouse enter, closes on mouse leave.
  // Touch devices keep the click toggle — without it the menu would be
  // unreachable on phones/tablets.
  const hoverSupported = useRef(false);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    hoverSupported.current = window.matchMedia("(hover: hover)").matches;
    return () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
  }, []);

  const handleMenuEnter = () => {
    if (!hoverSupported.current) return;
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setMenuOpen(true);
  };

  const handleMenuLeave = () => {
    if (!hoverSupported.current) return;
    // Small grace period so the cursor can cross the 10px gap between the
    // toggle and the dropdown without closing the menu.
    closeTimer.current = window.setTimeout(() => setMenuOpen(false), 200);
  };

  const handleToggleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // On hover-capable devices the menu is hover-driven; a mouse click
    // (detail > 0) is ignored so "only hover opens" holds. Keyboard activation
    // (detail 0) and touch devices still toggle.
    if (hoverSupported.current && event.detail > 0) return;
    setMenuOpen((v) => !v);
  };

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

  // Same prompt + targets as the Footer's AI row, so both entry points into
  // the feature deep-link to the identical conversation starters.
  const prompt = encodeURIComponent(t("footer.ai.prompt"));
  const aiModels: { key: ModelKey; name: string; href: string }[] = [
    { key: "chatgpt", name: t("footer.ai.models.chatgpt"), href: `https://chatgpt.com/?q=${prompt}` },
    { key: "claude", name: t("footer.ai.models.claude"), href: `https://claude.ai/new?q=${prompt}` },
    { key: "google", name: t("footer.ai.models.google"), href: `https://www.google.com/ai?q=${prompt}` },
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
          <div className="menu-wrap" onMouseEnter={handleMenuEnter} onMouseLeave={handleMenuLeave}>
            <button
              className="menu-toggle"
              onClick={handleToggleClick}
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

                <div className="mobile-ai" role="group" aria-labelledby="mobile-ai-label">
                  <span className="mobile-ai-label" id="mobile-ai-label">
                    {t("nav.ai")}
                  </span>
                  {aiModels.map((model) => (
                    <a
                      key={model.key}
                      className="mobile-ai-link"
                      href={model.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg
                        className="ai-icon"
                        viewBox={AI_ICONS[model.key].viewBox}
                        width="15"
                        height="15"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d={AI_ICONS[model.key].d} />
                      </svg>
                      <span>{model.name}</span>
                    </a>
                  ))}
                </div>

                <div className="mobile-lang">
                  <LangToggle />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}