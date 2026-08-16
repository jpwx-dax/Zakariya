"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Project } from "@/lib/data";
import { CaseStudy } from "@/lib/work";
import SmoothScroll from "../SmoothScroll";
import Cursor from "../Cursor";
import { RevealLines, FadeUp } from "../AnimatedText";
import CaseStudyContent from "./CaseStudyContent";

const EASE = [0.16, 1, 0.3, 1] as const;

const gradients = [
  "from-[#1a1a1a] via-[#241a15] to-[#0d0d0d]",
  "from-[#161616] via-[#1c1c22] to-[#0d0d0d]",
  "from-[#1a1512] via-[#2a1a10] to-[#0d0d0d]",
  "from-[#141414] via-[#101a18] to-[#0d0d0d]",
  "from-[#181414] via-[#221410] to-[#0d0d0d]",
  "from-[#141618] via-[#14181f] to-[#0d0d0d]",
  "from-[#1a1613] via-[#281c12] to-[#0d0d0d]",
  "from-[#151515] via-[#1e1a24] to-[#0d0d0d]",
];

export default function CaseStudyView({
  project,
  study,
  index,
  next,
}: {
  project: Project;
  study: CaseStudy;
  index: number;
  next: Project;
}) {
  const meta = [
    { label: "Role", value: study.meta.role },
    { label: "Scope", value: study.meta.scope },
    { label: "Tools", value: study.meta.tools },
    { label: "Year", value: project.year },
  ];
  if (study.meta.client) {
    meta.splice(3, 0, { label: "Client", value: study.meta.client });
  }

  return (
    <SmoothScroll>
      <Cursor />

      {/* Top bar */}
      <motion.header
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
        className="fixed inset-x-0 top-0 z-[900] bg-ink/70 backdrop-blur-md"
      >
        <nav className="container-x flex items-center justify-between py-5">
          <Link
            href="/"
            className="font-display text-lg tracking-tight text-paper"
          >
            ZS<span className="text-accent">.</span>
          </Link>
          <Link
            href="/#work"
            className="link-underline font-sans text-[0.82rem] uppercase tracking-[0.14em] text-paper/80 hover:text-paper"
          >
            ← All Work
          </Link>
        </nav>
      </motion.header>

      <main className="grain">
        {/* Hero */}
        <section className="relative flex min-h-[78svh] flex-col justify-end overflow-hidden bg-ink pb-14 pt-32 text-paper">
          <div
            className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${
              gradients[index % gradients.length]
            }`}
          />
          <div className="pointer-events-none absolute inset-0 opacity-[0.1] [background-image:linear-gradient(to_right,rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:52px_52px]" />

          <div className="container-x relative">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="mb-6 flex items-center gap-4 font-sans text-sm uppercase tracking-[0.18em] text-paper/60"
            >
              <span>
                {String(index + 1).padStart(2, "0")} / {project.discipline}
              </span>
            </motion.p>

            <RevealLines
              as="h1"
              className="display text-[13vw] leading-[0.9] tracking-tight sm:text-[8.5vw]"
              lines={[project.title]}
              delay={0.15}
            />

            <FadeUp delay={0.4}>
              <p className="mt-8 max-w-2xl font-serif text-xl leading-snug text-paper/80 sm:text-2xl">
                {study.intro}
              </p>
            </FadeUp>
          </div>
        </section>

        {/* Meta bar */}
        <section className="bg-paper text-ink">
          <div className="container-x grid grid-cols-2 gap-y-8 border-b border-ink/12 py-10 sm:grid-cols-4 lg:grid-cols-5">
            {meta.map((m, i) => (
              <FadeUp key={m.label} delay={i * 0.05}>
                <div>
                  <p className="font-sans text-xs uppercase tracking-[0.16em] text-muted">
                    {m.label}
                  </p>
                  <p className="mt-2 font-display text-lg tracking-tight text-ink">
                    {m.value}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
        </section>

        {/* Canva deck */}
        {project.deckEmbed && (
          <section className="bg-paper pt-16 text-ink sm:pt-24">
            <div className="container-x">
              <FadeUp>
                <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <span className="eyebrow text-ink/40">(The deck)</span>
                    <h2 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">
                      Presentation
                    </h2>
                  </div>
                  {project.deck && (
                    <a
                      href={project.deck}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor="hover"
                      className="inline-flex items-center gap-3 rounded-full bg-ink px-6 py-3 text-sm font-medium uppercase tracking-[0.12em] text-paper transition-transform duration-500 ease-expo hover:-translate-y-0.5"
                    >
                      Open the full deck <span>↗</span>
                    </a>
                  )}
                </div>
              </FadeUp>
              <FadeUp delay={0.05}>
                <div className="relative w-full overflow-hidden rounded-2xl border border-ink/12 bg-cloud shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)] [aspect-ratio:16/9]">
                  <iframe
                    src={project.deckEmbed}
                    title={`${project.title} — Canva deck`}
                    loading="lazy"
                    allowFullScreen
                    allow="fullscreen"
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
              </FadeUp>
              <FadeUp delay={0.1}>
                <p className="mt-3 font-sans text-sm text-muted">
                  If the deck doesn&apos;t load, open it directly in Canva above.
                </p>
              </FadeUp>
            </div>
          </section>
        )}

        {/* Body */}
        <section className="bg-paper py-20 text-ink sm:py-28">
          <div className="container-x">
            <CaseStudyContent content={study.content} />
          </div>
        </section>

        {/* Next project */}
        <section className="bg-ink text-paper">
          <Link href={`/work/${next.slug}`} className="group block" data-cursor="hover">
            <div className="container-x py-20 sm:py-28">
              <p className="eyebrow">Next project</p>
              <div className="mt-6 flex items-center justify-between gap-6">
                <h2 className="display text-5xl leading-[0.95] tracking-tight transition-transform duration-500 ease-expo group-hover:translate-x-3 sm:text-8xl">
                  {next.title}
                </h2>
                <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-paper/25 text-2xl transition-transform duration-500 ease-expo group-hover:-rotate-45 sm:h-20 sm:w-20">
                  →
                </span>
              </div>
              <p className="mt-4 font-sans text-sm uppercase tracking-[0.16em] text-paper/50">
                {next.discipline}
              </p>
            </div>
          </Link>
        </section>
      </main>
    </SmoothScroll>
  );
}
