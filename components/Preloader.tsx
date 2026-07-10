"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const EASE = [0.76, 0, 0.24, 1] as const;
const words = ["Zakariya Sayed", "Marketing", "Operations", "Strategy"];

export default function Preloader({ onDone }: { onDone: () => void }) {
  const [visible, setVisible] = useState(true);
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(0);

  // Cycle intro words
  useEffect(() => {
    if (index >= words.length - 1) return;
    const t = setTimeout(() => setIndex((i) => i + 1), index === 0 ? 620 : 320);
    return () => clearTimeout(t);
  }, [index]);

  // Counter 0 → 100
  useEffect(() => {
    if (count >= 100) return;
    const step = count < 80 ? 1 : 2;
    const t = setTimeout(() => setCount((c) => Math.min(100, c + step)), 18);
    return () => clearTimeout(t);
  }, [count]);

  // Finish
  useEffect(() => {
    if (count < 100) return;
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 900);
    }, 260);
    return () => clearTimeout(t);
  }, [count, onDone]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-ink"
          exit={{ y: "-100%" }}
          transition={{ duration: 1, ease: EASE }}
        >
          <div className="relative flex items-center gap-4 overflow-hidden">
            <motion.span
              className="h-2 w-2 rounded-full bg-accent"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, ease: EASE }}
            />
            <div className="overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  key={index}
                  className="block font-display text-2xl text-paper sm:text-3xl"
                  initial={{ y: "100%" }}
                  animate={{ y: "0%" }}
                  exit={{ y: "-100%" }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  {words[index]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          <div className="absolute bottom-8 right-6 font-display text-[18vw] leading-none text-paper/[0.06] sm:right-12 sm:text-[12vw]">
            {count.toString().padStart(3, "0")}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
