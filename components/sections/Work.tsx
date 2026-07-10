"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { projects, Project } from "@/lib/data";
import { FadeUp, RevealLines } from "../AnimatedText";

const EASE = [0.16, 1, 0.3, 1] as const;

// Deterministic gradient placeholder per card — swap for real imagery later.
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

function Card({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.12, 1]);

  return (
    <FadeUp delay={(index % 2) * 0.08}>
      <div ref={ref} className="group cursor-pointer" data-cursor="hover">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-ink">
          <motion.div
            style={{ scale, y }}
            className={`absolute inset-0 bg-gradient-to-br ${
              gradients[index % gradients.length]
            }`}
          />
          {/* faint grid texture */}
          <div className="absolute inset-0 opacity-[0.15] [background-image:linear-gradient(to_right,rgba(255,255,255,0.4)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.4)_1px,transparent_1px)] [background-size:44px_44px]" />

          <div className="absolute inset-0 flex flex-col justify-between p-7">
            <div className="flex items-start justify-between">
              <span className="font-sans text-xs uppercase tracking-[0.18em] text-paper/50">
                {project.discipline}
              </span>
              <span className="font-sans text-xs text-paper/50">
                {project.year}
              </span>
            </div>
            <span className="font-display text-[7rem] leading-none text-paper/[0.07] transition-colors duration-500 group-hover:text-accent/25">
              0{index + 1}
            </span>
          </div>

          {/* Hover veil + arrow */}
          <div className="absolute inset-0 flex items-center justify-center bg-ink/0 transition-colors duration-500 group-hover:bg-ink/20">
            <motion.span
              initial={false}
              className="grid h-16 w-16 translate-y-3 place-items-center rounded-full bg-paper text-ink opacity-0 transition-all duration-500 ease-expo group-hover:translate-y-0 group-hover:opacity-100"
            >
              ↗
            </motion.span>
          </div>
        </div>

        <div className="mt-5 flex items-start justify-between gap-6">
          <div>
            <h3 className="font-display text-2xl tracking-tight text-ink transition-transform duration-500 ease-expo group-hover:translate-x-1 sm:text-3xl">
              {project.title}
            </h3>
            <p className="mt-2 max-w-md text-base leading-relaxed text-ink/60">
              {project.description}
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {project.tags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-ink/15 px-3 py-1 font-sans text-xs text-ink/55"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </FadeUp>
  );
}

export default function Work() {
  return (
    <section id="work" className="bg-paper py-24 text-ink sm:py-32">
      <div className="container-x">
        <div className="mb-16 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
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
              A selection of disciplines and engagements. Case studies available
              on request.
            </p>
          </FadeUp>
        </div>

        <div className="grid gap-x-8 gap-y-16 md:grid-cols-2">
          {projects.map((p, i) => (
            <div key={p.title} className={i % 2 === 1 ? "md:mt-24" : ""}>
              <Card project={p} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
