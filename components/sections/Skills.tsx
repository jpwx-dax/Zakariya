"use client";

import { motion } from "framer-motion";
import { skills } from "@/lib/data";
import { FadeUp, RevealLines } from "../AnimatedText";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Skills() {
  return (
    <section id="skills" className="bg-ink py-24 text-paper sm:py-32">
      <div className="container-x">
        <div className="mb-16 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <span className="eyebrow">(Capabilities)</span>
            <RevealLines
              as="h2"
              className="display mt-5 text-5xl tracking-tight sm:text-7xl"
              lines={["What I do"]}
            />
          </div>
          <FadeUp delay={0.1}>
            <p className="max-w-sm font-sans text-base leading-relaxed text-paper/55">
              Five disciplines, one operator. From the first line of strategy to
              the last mile of fulfilment.
            </p>
          </FadeUp>
        </div>

        <div className="border-t border-paper/15">
          {skills.map((group, gi) => (
            <FadeUp key={group.category} delay={gi * 0.05}>
              <div className="group grid grid-cols-12 items-start gap-6 border-b border-paper/12 py-9 transition-colors duration-500 hover:bg-paper/[0.03]">
                <div className="col-span-12 flex items-baseline gap-5 sm:col-span-4">
                  <span className="font-sans text-sm text-paper/35">
                    {group.index}
                  </span>
                  <h3 className="font-display text-3xl tracking-tight transition-transform duration-500 ease-expo group-hover:translate-x-2 sm:text-5xl">
                    {group.category}
                  </h3>
                </div>
                <div className="col-span-12 flex flex-wrap gap-2.5 sm:col-span-8 sm:justify-end">
                  {group.skills.map((s, i) => (
                    <motion.span
                      key={s}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, ease: EASE, delay: i * 0.04 }}
                      className="rounded-full border border-paper/20 px-4 py-2 font-sans text-sm text-paper/80 transition-colors duration-300 hover:border-accent hover:text-paper"
                    >
                      {s}
                    </motion.span>
                  ))}
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
