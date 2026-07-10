"use client";

import { nav, site } from "@/lib/data";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-ink pb-10 pt-6 text-paper">
      <div className="container-x">
        <div className="flex flex-col gap-6 border-t border-paper/12 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {nav.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="link-underline font-sans text-sm text-paper/60 hover:text-paper"
              >
                {n.label}
              </a>
            ))}
          </div>
          <p className="font-sans text-sm text-paper/45">
            © {year} {site.name}. Crafted with intent.
          </p>
        </div>
      </div>
    </footer>
  );
}
