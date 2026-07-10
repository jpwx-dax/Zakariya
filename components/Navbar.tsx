"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { nav, site } from "@/lib/data";
import MagneticButton from "./MagneticButton";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: EASE, delay: 0.2 }}
        className="fixed inset-x-0 top-0 z-[900]"
      >
        <div
          className={`transition-colors duration-500 ${
            scrolled
              ? "bg-ink/70 backdrop-blur-md"
              : "bg-transparent"
          }`}
        >
          <nav className="container-x flex items-center justify-between py-5">
            <a
              href="#top"
              className="font-display text-lg tracking-tight text-paper"
            >
              ZS<span className="text-accent">.</span>
            </a>

            <ul className="hidden items-center gap-9 md:flex">
              {nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="link-underline font-sans text-[0.82rem] uppercase tracking-[0.14em] text-paper/80 hover:text-paper"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="hidden md:block">
              <MagneticButton
                href={`mailto:${site.email}`}
                className="rounded-full border border-paper/25 px-5 py-2 text-[0.78rem] uppercase tracking-[0.14em] text-paper transition-colors duration-500 hover:border-paper"
              >
                Get in touch
              </MagneticButton>
            </div>

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex flex-col gap-[6px] p-2 md:hidden"
              aria-label="Open menu"
            >
              <span className="block h-px w-7 bg-paper" />
              <span className="block h-px w-7 bg-paper" />
            </button>
          </nav>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[1000] flex flex-col bg-ink md:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <div className="container-x flex items-center justify-between py-5">
              <span className="font-display text-lg text-paper">
                ZS<span className="text-accent">.</span>
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 font-sans text-sm uppercase tracking-[0.14em] text-paper"
                aria-label="Close menu"
              >
                Close
              </button>
            </div>

            <ul className="container-x mt-6 flex flex-1 flex-col justify-center gap-2">
              {nav.map((item, i) => (
                <li key={item.href} className="overflow-hidden">
                  <motion.a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block font-display text-6xl text-paper"
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    transition={{
                      duration: 0.7,
                      ease: EASE,
                      delay: 0.15 + i * 0.06,
                    }}
                  >
                    {item.label}
                  </motion.a>
                </li>
              ))}
            </ul>

            <div className="container-x pb-10 font-sans text-sm text-paper/60">
              {site.email}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
