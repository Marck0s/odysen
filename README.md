# Odysen — website

A premium, scroll-driven marketing site for Odysen, built with Next.js (App Router), TypeScript and GSAP/ScrollTrigger.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

To build for production:

```bash
npm run build
npm run start
```

## Project structure

```
app/                 Next.js App Router entry points (layout, page)
components/
  nav/                Sticky navigation + language toggle
  hero/               Oversized headline hero
  story/              Pinned scroll sequence: WhatsApp conversation -> service explosion
  services/           Service chapters (headline, benefits, pricing) — data-driven
  about/              About + Ambition (shared SplitSection layout)
  team/               Team grid
  portfolio/          Case studies list
  process/            "How we work" steps
  testimonials/       Scroll-linked horizontal testimonial track
  faq/                Accordion
  cta/                Final call to action
  footer/              Footer
  whatsapp/           Persistent floating WhatsApp button
  shared/             Atmosphere background, loader, generic SplitSection
  experience/         HomeExperience — single client island (loader sync + providers)
hooks/                useTextReveal, useMagnetic/useTilt, useWhatsappStory
lib/
  config.ts            Central config — WHATSAPP_NUMBER lives here, nowhere else
  gsap.ts              Central GSAP + ScrollTrigger registration/export (import from here)
  motion.tsx           reduced-motion preference via MotionPreferenceProvider context
  data/                 Structural data (services, team, portfolio, testimonials, process, FAQ)
  i18n/                 pt-BR.json / en-US.json dictionaries + LanguageProvider context
public/assets/         Real Odysen logo (icon PNG, lockup PNG, loader MP4 + poster)
styles/globals.css     Design tokens and all component styles
```

## Configuration

- **WhatsApp number**: edit `WHATSAPP_NUMBER` in `lib/config.ts`. It's imported everywhere a WhatsApp link is needed — never hardcoded per-component.
- **Copy / translations**: edit `lib/i18n/pt-BR.json` and `lib/i18n/en-US.json`. Every UI string goes through the `t()` function from `useLanguage()`.
- **Pricing plan features**: `lib/data/services.ts` (`PLAN_FEATURES`), localized per plan.
- **Scripted WhatsApp conversation** (in `components/story/Story.tsx`): intentionally kept in Portuguese regardless of the language toggle, as authored brand content — same as a real customer conversation would be. Edit the constants at the top of that file to change it.

## Known scope notes

The pinned "conversation → four service cards" sequence and every other scroll interaction are built with real GSAP ScrollTrigger timelines against actual DOM elements (CSS/SVG). One Three.js WebGL layer exists — the floating-line backdrop inside the phone (`components/story/FloatingLines.tsx`) via `three` + ShaderMaterial — kept isolated from the scroll logic in `hooks/useWhatsappStory.ts`. If a true 3D phone/scene is required later, `components/story/Story.tsx` and `hooks/useWhatsappStory.ts` are the place to swap in a React Three Fiber canvas — the scroll-progress logic is already isolated there.

The team section uses initials placeholders instead of real portrait photography — drop real photos into `public/assets/team/` and swap the `<div className="initials">` block in `components/team/Team.tsx` for an `<img>` once photos are available.

Pricing shown is placeholder — confirm real numbers before launch.
