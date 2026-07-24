"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { site } from "@/lib/data";
import MagneticButton from "../MagneticButton";

const EASE = [0.16, 1, 0.3, 1] as const;

function Line({
  children,
  delay,
  start,
  className = "",
}: {
  children: React.ReactNode;
  delay: number;
  start: boolean;
  className?: string;
}) {
  return (
    <span className="reveal-mask">
      <motion.span
        className={`block ${className}`}
        initial={{ y: "110%" }}
        animate={start ? { y: "0%" } : { y: "110%" }}
        transition={{ duration: 1.1, ease: EASE, delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export default function Hero({ start }: { start: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const base = 0; // reveals are gated by the `start` flag, not by delay

  return (
    <section
      ref={ref}
      id="top"
      className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden bg-ink pb-10 pt-32 text-paper"
    >
      {/* top meta row */}
      <motion.div
        className="container-x flex items-start justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: start ? 1 : 0 }}
        transition={{ duration: 1, delay: base + 0.1 }}
      >
        <p className="max-w-[16ch] font-sans text-sm leading-relaxed text-paper/55">
          Digital marketing & business operations — building brands and the
          systems behind them.
        </p>
        <p className="hidden font-sans text-sm text-paper/55 sm:block">
          {site.location}
          <br />
          Est. 2020
        </p>
      </motion.div>

      {/* Giant name */}
      <motion.div style={{ y, opacity }} className="container-x">
        <h1 className="display text-[19vw] leading-[0.82] sm:text-[17vw] lg:text-[15vw]">
          <Line delay={base + 0.15} start={start}>
            Zakariya
          </Line>
          <Line
            delay={base + 0.28}
            start={start}
            className="pl-[0.06em] text-paper/90"
          >
            Sayed
          </Line>
        </h1>

        <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="overflow-hidden">
            <motion.p
              className="max-w-xl font-serif text-lg leading-snug text-paper/75 sm:text-xl"
              initial={{ y: "120%" }}
              animate={{ y: start ? "0%" : "120%" }}
              transition={{ duration: 1, ease: EASE, delay: base + 0.5 }}
            >
              <span className="italic">Digital Marketing</span> &amp;{" "}
              <span className="italic">Business Operations</span> — where
              strategy meets execution.
            </motion.p>
          </div>

          <motion.div
            className="flex flex-wrap items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={start ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease: EASE, delay: base + 0.7 }}
          >
            <MagneticButton
              href="#work"
              className="rounded-full bg-paper px-7 py-3.5 text-sm font-medium uppercase tracking-[0.12em] text-ink"
            >
              View Work
            </MagneticButton>
            <MagneticButton
              href={site.resume}
              download
              className="rounded-full border border-paper/25 px-7 py-3.5 text-sm uppercase tracking-[0.12em] text-paper hover:border-paper"
            >
              Résumé
            </MagneticButton>
            <MagneticButton
              href="#contact"
              className="rounded-full border border-paper/25 px-7 py-3.5 text-sm uppercase tracking-[0.12em] text-paper hover:border-paper"
            >
              Contact
            </MagneticButton>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        className="container-x flex items-center justify-between pt-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: start ? 1 : 0 }}
        transition={{ duration: 1, delay: base + 0.9 }}
      >
        <span className="eyebrow">Scroll to explore</span>
        <motion.span
          className="h-10 w-px bg-paper/30"
          animate={{ scaleY: [0.3, 1, 0.3], transformOrigin: "top" }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <span className="eyebrow hidden sm:block">Available for work</span>
      </motion.div>
    </section>
  );
}
