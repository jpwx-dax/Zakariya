"use client";

import { motion, useInView } from "framer-motion";
import { ReactNode, useRef } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * RevealLines — splits children (an array of strings) into masked lines that
 * slide up on scroll into view. Editorial mask-reveal used for headings.
 */
export function RevealLines({
  lines,
  className = "",
  lineClassName = "",
  delay = 0,
  stagger = 0.08,
  as = "div",
}: {
  lines: string[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
  as?: "div" | "h1" | "h2" | "h3" | "p";
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px -10% 0px" });
  const Tag = motion[as];

  return (
    <Tag ref={ref} className={className}>
      {lines.map((line, i) => (
        <span key={i} className="reveal-mask">
          <motion.span
            className={`block ${lineClassName}`}
            initial={{ y: "110%" }}
            animate={inView ? { y: "0%" } : { y: "110%" }}
            transition={{
              duration: 1,
              ease: EASE,
              delay: delay + i * stagger,
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/**
 * FadeUp — simple staggered fade-and-rise for blocks / paragraphs / cards.
 */
export function FadeUp({
  children,
  className = "",
  delay = 0,
  y = 28,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, margin: "-8% 0px -8% 0px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/**
 * WordsReveal — reveals a paragraph word-by-word with a subtle opacity wipe.
 */
export function WordsReveal({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const words = text.split(" ");
  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <motion.span
            className="inline-block"
            initial={{ y: "100%", opacity: 0 }}
            animate={inView ? { y: "0%", opacity: 1 } : {}}
            transition={{
              duration: 0.7,
              ease: EASE,
              delay: i * 0.018,
            }}
          >
            {word}&nbsp;
          </motion.span>
        </span>
      ))}
    </p>
  );
}
