"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { experience } from "@/lib/data";
import { FadeUp, RevealLines } from "../AnimatedText";

const EASE = [0.16, 1, 0.3, 1] as const;

function Row({
  item,
  index,
  open,
  onToggle,
}: {
  item: (typeof experience)[number];
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-ink/12">
      <button
        type="button"
        onClick={onToggle}
        className="group flex w-full items-center justify-between gap-6 py-8 text-left sm:py-10"
        aria-expanded={open}
      >
        <div className="flex items-baseline gap-4 sm:gap-8">
          <span className="font-sans text-sm text-muted">
            0{index + 1}
          </span>
          <span className="font-display text-4xl leading-none tracking-tight transition-transform duration-500 ease-expo group-hover:translate-x-2 sm:text-6xl">
            {item.company}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className="hidden font-sans text-sm text-muted md:block">
            {item.period}
          </span>
          <motion.span
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-ink/25 text-lg"
          >
            +
          </motion.span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="grid gap-8 pb-12 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="font-serif text-xl italic text-ink/80">
                  {item.role}
                </p>
                <p className="mt-3 font-sans text-sm text-muted md:hidden">
                  {item.period}
                </p>
                <p className="mt-3 font-sans text-sm text-muted">
                  {item.location}
                </p>
                <p className="mt-6 max-w-sm text-base leading-relaxed text-ink/70">
                  {item.summary}
                </p>
              </div>
              <ul className="space-y-4 lg:col-span-8">
                {item.achievements.map((a, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, ease: EASE, delay: 0.1 + i * 0.06 }}
                    className="flex gap-4 border-t border-ink/10 pt-4 text-lg leading-relaxed text-ink/80"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span>{a}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Experience() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="experience" className="bg-paper py-24 text-ink sm:py-32">
      <div className="container-x">
        <div className="mb-14 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <RevealLines
            as="h2"
            className="display text-5xl tracking-tight sm:text-7xl"
            lines={["Experience"]}
          />
          <FadeUp delay={0.1}>
            <p className="max-w-xs font-sans text-base leading-relaxed text-muted">
              A track record across client servicing, content strategy and
              full-stack business operations.
            </p>
          </FadeUp>
        </div>

        <div className="border-t border-ink/12">
          {experience.map((item, i) => (
            <Row
              key={item.company}
              item={item}
              index={i}
              open={open === i}
              onToggle={() => setOpen(open === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
