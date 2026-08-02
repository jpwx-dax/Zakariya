"use client";

import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/* URL helpers                                                         */
/* ------------------------------------------------------------------ */

function youTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/shorts\/)([\w-]{11})/,
    /(?:youtube\.com\/embed\/)([\w-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function isInstagram(url: string) {
  return /instagram\.com\/(p|reel|tv)\//.test(url);
}

/* ------------------------------------------------------------------ */
/* YouTube                                                             */
/* ------------------------------------------------------------------ */

function YouTubeEmbed({ id }: { id: string }) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-ink/90 [aspect-ratio:16/9]">
      <iframe
        className="absolute inset-0 h-full w-full"
        src={`https://www.youtube-nocookie.com/embed/${id}`}
        title="YouTube video"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Instagram — official embed with a link-card fallback               */
/* ------------------------------------------------------------------ */

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

let igScriptPromise: Promise<void> | null = null;
function loadInstagramScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.instgrm) return Promise.resolve();
  if (igScriptPromise) return igScriptPromise;
  igScriptPromise = new Promise<void>((resolve) => {
    const s = document.createElement("script");
    s.src = "https://www.instagram.com/embed.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => resolve(); // fall back silently
    document.body.appendChild(s);
  });
  return igScriptPromise;
}

function InstagramEmbed({ url }: { url: string }) {
  const ref = useRef<HTMLQuoteElement>(null);
  const [failed, setFailed] = useState(false);
  const permalink = url.split("?")[0];

  useEffect(() => {
    let cancelled = false;
    loadInstagramScript().then(() => {
      if (cancelled) return;
      window.instgrm?.Embeds.process();
    });
    // If the embed hasn't rendered an iframe after a few seconds, show fallback.
    const t = setTimeout(() => {
      if (cancelled) return;
      if (ref.current && !ref.current.querySelector("iframe")) setFailed(true);
    }, 4000);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [url]);

  if (failed) return <LinkCard url={url} label="View on Instagram" />;

  return (
    <div className="flex justify-center">
      <blockquote
        ref={ref}
        className="instagram-media"
        data-instgrm-permalink={permalink}
        data-instgrm-version="14"
        style={{
          background: "#FFF",
          border: 0,
          borderRadius: 16,
          margin: 0,
          maxWidth: 540,
          width: "100%",
          padding: 0,
        }}
      >
        <a href={permalink} target="_blank" rel="noopener noreferrer">
          View this post on Instagram
        </a>
      </blockquote>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Generic fallback card                                               */
/* ------------------------------------------------------------------ */

function LinkCard({ url, label }: { url: string; label?: string }) {
  let host = url;
  try {
    host = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    /* keep raw */
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor="hover"
      className="group flex items-center justify-between gap-6 rounded-2xl border border-ink/15 bg-cloud px-7 py-6 transition-colors duration-500 hover:border-ink/40"
    >
      <div>
        <p className="font-sans text-xs uppercase tracking-[0.16em] text-muted">
          {host}
        </p>
        <p className="mt-1 font-display text-xl tracking-tight text-ink">
          {label ?? "Open link"}
        </p>
      </div>
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-ink/25 text-lg transition-transform duration-500 ease-expo group-hover:-rotate-45">
        →
      </span>
    </a>
  );
}

/* ------------------------------------------------------------------ */
/* Public component                                                    */
/* ------------------------------------------------------------------ */

export default function Embed({ url }: { url: string }) {
  const yt = youTubeId(url);
  if (yt) return <YouTubeEmbed id={yt} />;
  if (isInstagram(url)) return <InstagramEmbed url={url} />;
  return <LinkCard url={url} />;
}
