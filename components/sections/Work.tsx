"use client";

import { projects, Project } from "@/lib/data";
import { FadeUp, RevealLines } from "../AnimatedText";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// Only projects that have a deck are shown — each card is the deck's front
// page, and clicking it opens the full deck (PDF).
const decks = projects.filter((p) => p.deckPdf);

function posterFor(p: Project) {
  return `${BASE}${p
    .deckPdf!.replace("/decks/", "/decks/posters/")
    .replace(".pdf", ".jpg")}`;
}

function DeckCard({ project, index }: { project: Project; index: number }) {
  return (
    <FadeUp delay={(index % 2) * 0.08}>
      <a
        href={`${BASE}${project.deckPdf}`}
        target="_blank"
        rel="noopener noreferrer"
        data-cursor="hover"
        aria-label={`Open ${project.title} deck`}
        className="group block overflow-hidden rounded-2xl border border-ink/10 bg-ink shadow-[0_20px_60px_-30px_rgba(0,0,0,0.4)]"
      >
        <div className="relative w-full overflow-hidden [aspect-ratio:16/9]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={posterFor(project)}
            alt={`${project.title} — deck preview`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-expo group-hover:scale-[1.04]"
          />
          {/* hover veil + open cue */}
          <div className="absolute inset-0 flex items-center justify-center bg-ink/0 transition-colors duration-500 group-hover:bg-ink/35">
            <span className="flex items-center gap-2 rounded-full bg-paper px-6 py-3 text-sm font-medium uppercase tracking-[0.12em] text-ink opacity-0 shadow-lg transition-all duration-500 ease-expo group-hover:opacity-100">
              Open deck <span aria-hidden>↗</span>
            </span>
          </div>
        </div>
      </a>
    </FadeUp>
  );
}

export default function Work() {
  return (
    <section id="work" className="bg-paper py-24 text-ink sm:py-32">
      <div className="container-x">
        <div className="mb-14 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <span className="eyebrow text-ink/40">(Selected Work)</span>
            <RevealLines
              as="h2"
              className="display mt-5 text-5xl leading-[0.95] tracking-tight sm:text-8xl"
              lines={["Featured", "Work"]}
            />
          </div>
          <FadeUp delay={0.1}>
            <p className="max-w-xs font-sans text-base leading-relaxed text-muted">
              A selection of decks — tap any preview to open the full
              presentation.
            </p>
          </FadeUp>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {decks.map((p, i) => (
            <DeckCard key={p.slug} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
