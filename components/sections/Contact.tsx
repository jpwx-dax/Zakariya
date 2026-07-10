"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { site } from "@/lib/data";
import { FadeUp, RevealLines } from "../AnimatedText";
import MagneticButton from "../MagneticButton";

const details = [
  { label: "Email", value: site.email, href: `mailto:${site.email}` },
  { label: "Phone", value: site.phone, href: `tel:${site.phoneHref}` },
  { label: "LinkedIn", value: "in/zakariya-sayed", href: site.linkedin },
  { label: "Location", value: site.location, href: undefined },
];

export default function Contact() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [120, 0]);

  return (
    <section
      ref={ref}
      id="contact"
      className="relative overflow-hidden bg-ink py-24 text-paper sm:py-32"
    >
      <div className="container-x">
        <span className="eyebrow">(Contact)</span>

        <div className="mt-8 max-w-5xl">
          <RevealLines
            as="h2"
            className="display text-[15vw] leading-[0.86] tracking-tight sm:text-[11vw]"
            lines={["Let's build", "something"]}
          />
          <div className="flex items-center gap-4">
            <span className="reveal-mask">
              <motion.span
                className="display block text-[15vw] leading-[0.86] tracking-tight text-accent sm:text-[11vw]"
                initial={{ y: "110%" }}
                whileInView={{ y: "0%" }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              >
                that lasts.
              </motion.span>
            </span>
          </div>
        </div>

        <div className="mt-16 grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <FadeUp>
              <p className="max-w-md font-serif text-2xl leading-snug text-paper/80">
                Open to roles and collaborations in marketing, operations and
                growth. Let&apos;s talk.
              </p>
            </FadeUp>
            <FadeUp delay={0.1}>
              <div className="mt-10">
                <MagneticButton
                  href={`mailto:${site.email}`}
                  strength={0.25}
                  className="inline-flex items-center gap-4 rounded-full bg-paper px-9 py-5 text-base font-medium uppercase tracking-[0.1em] text-ink"
                >
                  Start a conversation
                  <span>↗</span>
                </MagneticButton>
              </div>
            </FadeUp>
          </div>

          <div className="lg:col-span-7">
            <ul className="border-t border-paper/15">
              {details.map((d, i) => (
                <FadeUp key={d.label} delay={i * 0.05}>
                  <li className="border-b border-paper/12">
                    {d.href ? (
                      <a
                        href={d.href}
                        target={d.href.startsWith("http") ? "_blank" : undefined}
                        rel={
                          d.href.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="group flex items-center justify-between py-6"
                      >
                        <span className="font-sans text-sm uppercase tracking-[0.16em] text-paper/45">
                          {d.label}
                        </span>
                        <span className="font-display text-2xl tracking-tight transition-transform duration-500 ease-expo group-hover:-translate-x-2 sm:text-3xl">
                          {d.value}
                        </span>
                      </a>
                    ) : (
                      <div className="flex items-center justify-between py-6">
                        <span className="font-sans text-sm uppercase tracking-[0.16em] text-paper/45">
                          {d.label}
                        </span>
                        <span className="font-display text-2xl tracking-tight sm:text-3xl">
                          {d.value}
                        </span>
                      </div>
                    )}
                  </li>
                </FadeUp>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Oversized watermark */}
      <motion.p
        style={{ y }}
        aria-hidden
        className="pointer-events-none mt-24 whitespace-nowrap text-center font-display text-[26vw] leading-none text-paper/[0.04]"
      >
        Zakariya Sayed
      </motion.p>
    </section>
  );
}
