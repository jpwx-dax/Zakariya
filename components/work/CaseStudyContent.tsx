"use client";

import { Block } from "@/lib/work";
import { FadeUp } from "../AnimatedText";
import Embed from "./Embed";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const asset = (src?: string) =>
  src ? (src.startsWith("http") ? src : `${BASE}${src}`) : undefined;

const gradientThemes = [
  "from-[#1c1c1c] via-[#241a15] to-[#0d0d0d]",
  "from-[#151515] via-[#1c1c22] to-[#0d0d0d]",
  "from-[#1a1512] via-[#2a1a10] to-[#0d0d0d]",
  "from-[#141414] via-[#101a18] to-[#0d0d0d]",
];

const ACCENT = "#cb4b24";

// Deterministic abstract vector art used to fill image slots until real
// imagery is dropped in. Six on-brand variants, chosen by seed.
function VectorArt({ seed }: { seed: number }) {
  const v = ((seed % 6) + 6) % 6;
  const line = "rgba(244,241,236,0.5)";
  const faint = "rgba(244,241,236,0.16)";
  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      {v === 0 &&
        Array.from({ length: 7 }).map((_, i) => (
          <circle
            key={i}
            cx="200"
            cy="150"
            r={22 + i * 22}
            fill="none"
            stroke={i === 2 ? ACCENT : faint}
            strokeWidth={i === 2 ? 2 : 1}
          />
        ))}
      {v === 1 &&
        Array.from({ length: 14 }).map((_, i) => (
          <line
            key={i}
            x1={-40 + i * 40}
            y1="0"
            x2={80 + i * 40}
            y2="300"
            stroke={i === 5 ? ACCENT : faint}
            strokeWidth={i === 5 ? 2 : 1}
          />
        ))}
      {v === 2 && (
        <g>
          {Array.from({ length: 9 }).map((_, r) =>
            Array.from({ length: 12 }).map((_, c) => (
              <circle
                key={`${r}-${c}`}
                cx={20 + c * 34}
                cy={20 + r * 34}
                r={r === 4 && c === 7 ? 5 : 2}
                fill={r === 4 && c === 7 ? ACCENT : faint}
              />
            ))
          )}
        </g>
      )}
      {v === 3 && (
        <g fill="none" strokeWidth="1.5">
          <path d="M0 220 C 80 120, 160 260, 260 140 S 400 120, 400 180" stroke={line} />
          <path d="M0 250 C 90 170, 170 290, 270 180 S 400 170, 400 220" stroke={faint} />
          <path d="M0 190 C 70 90, 150 210, 250 110 S 400 80, 400 150" stroke={ACCENT} opacity="0.7" />
        </g>
      )}
      {v === 4 &&
        [60, 120, 200, 150, 240, 100, 180].map((h, i) => (
          <rect
            key={i}
            x={24 + i * 52}
            y={280 - h}
            width="30"
            height={h}
            rx="3"
            fill={i === 4 ? ACCENT : faint}
          />
        ))}
      {v === 5 && (
        <g fill="none" stroke={faint} strokeWidth="1">
          <polygon points="200,40 340,120 340,240 200,300 60,240 60,120" stroke={line} />
          <polygon points="200,90 300,145 300,215 200,260 100,215 100,145" />
          <circle cx="200" cy="175" r="26" stroke={ACCENT} strokeWidth="2" />
        </g>
      )}
    </svg>
  );
}

function Placeholder({
  ratio = "16/9",
  seed = 0,
}: {
  ratio?: string;
  seed?: number;
}) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl bg-gradient-to-br ${
        gradientThemes[seed % gradientThemes.length]
      }`}
      style={{ aspectRatio: ratio }}
    >
      <div className="absolute inset-0 opacity-[0.5]">
        <VectorArt seed={seed} />
      </div>
      <div className="absolute bottom-4 left-5">
        <span className="font-display text-lg tracking-tight text-paper/25">
          ZS
        </span>
      </div>
    </div>
  );
}

function ImageBlock({
  src,
  alt,
  ratio,
  seed = 0,
}: {
  src?: string;
  alt?: string;
  ratio?: string;
  seed?: number;
}) {
  const resolved = asset(src);
  if (!resolved) return <Placeholder ratio={ratio} seed={seed} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolved}
      alt={alt ?? ""}
      loading="lazy"
      className="w-full rounded-2xl object-cover"
      style={{ aspectRatio: ratio }}
    />
  );
}

function BlockView({ block, seed }: { block: Block; seed: number }) {
  switch (block.type) {
    case "lead":
      return (
        <p className="max-w-3xl font-serif text-2xl leading-snug text-ink sm:text-[2rem]">
          {block.text}
        </p>
      );
    case "heading":
      return (
        <h2 className="max-w-3xl font-display text-3xl tracking-tight text-ink sm:text-4xl">
          {block.text}
        </h2>
      );
    case "paragraph":
      return (
        <p className="max-w-2xl text-lg leading-relaxed text-ink/70">
          {block.text}
        </p>
      );
    case "list":
      return (
        <ul className="max-w-2xl space-y-3">
          {block.items.map((it, i) => (
            <li
              key={i}
              className="flex gap-4 border-t border-ink/10 pt-3 text-lg leading-relaxed text-ink/80"
            >
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      );
    case "quote":
      return (
        <blockquote className="max-w-3xl border-l-2 border-accent pl-6">
          <p className="font-serif text-2xl italic leading-snug text-ink sm:text-3xl">
            “{block.text}”
          </p>
          {block.cite && (
            <cite className="mt-3 block font-sans text-sm not-italic text-muted">
              — {block.cite}
            </cite>
          )}
        </blockquote>
      );
    case "stats":
      return (
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-ink/12 bg-ink/12 sm:grid-cols-3">
          {block.items.map((s, i) => (
            <div key={i} className="bg-paper p-8">
              <p className="font-display text-4xl tracking-tight text-accent sm:text-5xl">
                {s.value}
              </p>
              <p className="mt-2 font-sans text-sm text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      );
    case "image":
      return (
        <figure>
          <ImageBlock
            src={block.src}
            alt={block.alt}
            ratio={block.ratio}
            seed={seed}
          />
          {block.caption && (
            <figcaption className="mt-3 font-sans text-sm text-muted">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    case "gallery":
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {block.images.map((im, i) => (
            <ImageBlock
              key={i}
              src={im.src}
              alt={im.alt}
              ratio="1/1"
              seed={seed * 3 + i + 1}
            />
          ))}
        </div>
      );
    case "embed":
      return (
        <figure>
          <Embed url={block.url} />
          {block.caption && (
            <figcaption className="mt-3 font-sans text-sm text-muted">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    default:
      return null;
  }
}

export default function CaseStudyContent({ content }: { content: Block[] }) {
  return (
    <div className="space-y-12 sm:space-y-16">
      {content.map((block, i) => (
        <FadeUp key={i} delay={0}>
          <BlockView block={block} seed={i} />
        </FadeUp>
      ))}
    </div>
  );
}
