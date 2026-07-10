"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Cursor — a soft trailing dot that grows over interactive elements.
 * Disabled on touch / coarse pointers and for reduced-motion users.
 */
export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });

  useEffect(() => {
    const fine =
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine) return;

    setEnabled(true);
    document.documentElement.classList.add("custom-cursor-active");

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const el = e.target as HTMLElement;
      setHovering(
        !!el.closest(
          'a, button, [data-cursor="hover"], input, textarea, [role="button"]'
        )
      );
    };

    window.addEventListener("mousemove", move);
    return () => {
      window.removeEventListener("mousemove", move);
      document.documentElement.classList.remove("custom-cursor-active");
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[9998] mix-blend-difference"
      style={{ x: sx, y: sy }}
    >
      <motion.span
        className="block rounded-full bg-white"
        animate={{
          width: hovering ? 56 : 12,
          height: hovering ? 56 : 12,
          x: hovering ? -28 : -6,
          y: hovering ? -28 : -6,
        }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
      />
    </motion.div>
  );
}
