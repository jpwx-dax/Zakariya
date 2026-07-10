# Zakariya Sayed — Portfolio

A premium, agency-grade personal portfolio for **Zakariya Sayed**, a Digital
Marketing & Business Operations professional. Built with an editorial, minimal
aesthetic — large typography, smooth scrolling, mask reveals, magnetic buttons
and subtle scroll-triggered motion.

## Stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS** for styling
- **Framer Motion** for animation (reveals, parallax, magnetic, page motion)
- **Lenis** for smooth scrolling
- `next/font` for premium typography — Bricolage Grotesque (display),
  Fraunces (editorial serif), Inter (body)

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build    # production build (static export-ready)
npm run start    # serve the production build
npm run lint     # eslint
```

## Project structure

```
app/
  layout.tsx        # fonts, SEO metadata, JSON-LD, viewport
  page.tsx          # assembles the sections + preloader gating
  globals.css       # Tailwind layers, base styles, utilities, grain
  icon.tsx          # generated favicon
  robots.ts         # robots.txt route
  sitemap.ts        # sitemap.xml route
components/
  SmoothScroll.tsx  # Lenis wrapper + anchor smooth-scroll
  Preloader.tsx     # intro loader (word cycle + counter)
  Cursor.tsx        # trailing custom cursor (pointer-fine only)
  Navbar.tsx        # sticky nav + full-screen mobile menu
  MagneticButton.tsx# magnetic hover interaction
  AnimatedText.tsx  # RevealLines / FadeUp / WordsReveal primitives
  Footer.tsx
  sections/
    Hero.tsx        # giant animated name + parallax
    About.tsx       # story, focus marquee, education timeline
    Experience.tsx  # interactive expandable company timeline
    Skills.tsx      # five capability categories with tag pills
    Work.tsx        # featured work grid (parallax gradient cards)
    Resume.tsx      # preview card + download
    Contact.tsx     # oversized CTA + contact details
lib/
  data.ts           # single source of truth (all CV content)
public/
  resume.pdf        # downloadable résumé
```

## Content

All copy and data live in `lib/data.ts` — edit that one file to update the
name, role, experience, skills, projects, education and contact details.
Replace `public/resume.pdf` to swap the downloadable résumé, and drop real
imagery into the featured-work cards in `components/sections/Work.tsx` (the
gradient placeholders are designed to be replaced by `next/image`).

## Performance & accessibility

- Fully static prerender (`○ Static`) — no client data fetching
- Respects `prefers-reduced-motion` (smooth scroll, marquee and cursor disable)
- Semantic landmarks, focusable controls, descriptive labels
- SEO: Open Graph, Twitter, canonical, sitemap, robots and Person JSON-LD

## Deployment

Deploy to any Node host or, ideally, **Vercel**:

```bash
vercel
```

No environment variables are required.
