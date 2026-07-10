"use client";

import { about, education } from "@/lib/data";
import { FadeUp, RevealLines, WordsReveal } from "../AnimatedText";

function Marquee() {
  const items = [...about.focus, ...about.focus];
  return (
    <div className="relative flex overflow-hidden border-y border-ink/10 py-6">
      <div className="animate-marquee flex shrink-0 items-center gap-10 whitespace-nowrap pr-10">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-10">
            <span className="font-display text-2xl uppercase tracking-tight text-ink/80 sm:text-3xl">
              {item}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
        ))}
      </div>
    </div>
  );
}

export default function About() {
  return (
    <section
      id="about"
      className="relative bg-paper py-24 text-ink sm:py-32"
    >
      <Marquee />

      <div className="container-x mt-24">
        <div className="grid gap-16 lg:grid-cols-12">
          {/* Sticky label */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <span className="eyebrow text-ink/40">(About)</span>
              <FadeUp className="mt-6" delay={0.05}>
                <p className="flex items-baseline gap-3">
                  <span className="font-display text-7xl text-accent sm:text-8xl">
                    {about.years}
                  </span>
                  <span className="max-w-[12ch] font-sans text-sm leading-snug text-muted">
                    years bridging marketing &amp; operations
                  </span>
                </p>
              </FadeUp>
            </div>
          </div>

          {/* Story */}
          <div className="lg:col-span-8">
            <RevealLines
              as="h2"
              className="display text-4xl leading-[1.02] tracking-tight sm:text-6xl"
              lines={["Not just a marketer —", "an operator who ships."]}
              lineClassName=""
            />

            <div className="mt-12 max-w-2xl space-y-7">
              <WordsReveal
                text={about.intro}
                className="font-serif text-2xl leading-snug text-ink sm:text-3xl"
              />
              {about.paragraphs.map((p, i) => (
                <FadeUp key={i} delay={0.05 * i}>
                  <p className="text-lg leading-relaxed text-ink/70">{p}</p>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>

        {/* Education timeline */}
        <div className="mt-28">
          <FadeUp>
            <div className="mb-10 flex items-end justify-between border-b border-ink/15 pb-4">
              <span className="eyebrow text-ink/40">(Education)</span>
              <span className="font-sans text-sm text-muted">
                Foundation in business &amp; finance
              </span>
            </div>
          </FadeUp>

          <ul>
            {education.map((edu, i) => (
              <FadeUp key={i} delay={i * 0.05}>
                <li className="group grid grid-cols-12 items-baseline gap-4 border-b border-ink/10 py-6 transition-colors hover:bg-ink/[0.02]">
                  <span className="col-span-12 font-display text-3xl tracking-tight sm:col-span-4 sm:text-4xl">
                    {edu.qualification}
                  </span>
                  <span className="col-span-8 font-sans text-base text-ink/70 sm:col-span-5 sm:text-lg">
                    {edu.institution}
                  </span>
                  <span className="col-span-4 text-right font-sans text-sm text-muted sm:col-span-3">
                    {edu.year}
                  </span>
                </li>
              </FadeUp>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
