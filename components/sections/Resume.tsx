"use client";

import { site, skills, experience } from "@/lib/data";
import { FadeUp, RevealLines } from "../AnimatedText";
import MagneticButton from "../MagneticButton";

export default function Resume() {
  return (
    <section id="resume" className="bg-bone py-24 text-ink sm:py-32">
      <div className="container-x">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <span className="eyebrow text-ink/40">(Résumé)</span>
              <RevealLines
                as="h2"
                className="display mt-5 text-5xl leading-[0.95] tracking-tight sm:text-7xl"
                lines={["The full", "story."]}
              />
              <FadeUp delay={0.1}>
                <p className="mt-8 max-w-md text-lg leading-relaxed text-ink/70">
                  A one-page summary of experience, education and capabilities —
                  ready to print, forward or file.
                </p>
              </FadeUp>
              <FadeUp delay={0.15}>
                <div className="mt-10 flex flex-wrap gap-3">
                  <MagneticButton
                    href={site.resume}
                    download
                    className="rounded-full bg-ink px-8 py-4 text-sm font-medium uppercase tracking-[0.12em] text-paper"
                  >
                    Download Résumé ↓
                  </MagneticButton>
                  <MagneticButton
                    href={site.resume}
                    className="rounded-full border border-ink/25 px-8 py-4 text-sm uppercase tracking-[0.12em] text-ink hover:border-ink"
                  >
                    Open PDF
                  </MagneticButton>
                </div>
              </FadeUp>
            </div>
          </div>

          {/* Preview card */}
          <div className="lg:col-span-7">
            <FadeUp>
              <div className="rounded-2xl border border-ink/15 bg-cloud p-8 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)] sm:p-12">
                <div className="flex items-start justify-between border-b border-ink/15 pb-6">
                  <div>
                    <p className="font-display text-3xl tracking-tight">
                      {site.name}
                    </p>
                    <p className="mt-1 font-serif text-base italic text-ink/70">
                      {site.role}
                    </p>
                  </div>
                  <div className="text-right font-sans text-xs leading-relaxed text-muted">
                    {site.location}
                    <br />
                    {site.email}
                  </div>
                </div>

                <div className="mt-7">
                  <p className="eyebrow text-ink/40">Experience</p>
                  <ul className="mt-4 space-y-4">
                    {experience.map((e) => (
                      <li
                        key={e.company}
                        className="flex items-baseline justify-between gap-4 border-b border-ink/10 pb-4"
                      >
                        <div>
                          <p className="font-display text-xl tracking-tight">
                            {e.company}
                          </p>
                          <p className="font-sans text-sm text-ink/60">
                            {e.role}
                          </p>
                        </div>
                        <span className="shrink-0 font-sans text-sm text-muted">
                          {e.period}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-7">
                  <p className="eyebrow text-ink/40">Core skills</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {skills.flatMap((g) => g.skills.slice(0, 2)).map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-ink/[0.06] px-3 py-1.5 font-sans text-xs text-ink/70"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </div>
    </section>
  );
}
