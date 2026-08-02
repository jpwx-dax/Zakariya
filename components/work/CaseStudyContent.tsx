"use client";

import { Block } from "@/lib/work";
import { FadeUp } from "../AnimatedText";
import Embed from "./Embed";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const asset = (src?: string) =>
  src ? (src.startsWith("http") ? src : `${BASE}${src}`) : undefined;

function Placeholder({ ratio = "16/9" }: { ratio?: string }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1a1a] via-[#241a15] to-[#0d0d0d]"
      style={{ aspectRatio: ratio }}
    >
      <div className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(to_right,rgba(255,255,255,0.4)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.4)_1px,transparent_1px)] [background-size:40px_40px]" />
      <div className="absolute inset-0 grid place-items-center">
        <span className="font-sans text-xs uppercase tracking-[0.2em] text-paper/40">
          Image placeholder
        </span>
      </div>
    </div>
  );
}

function ImageBlock({
  src,
  alt,
  ratio,
}: {
  src?: string;
  alt?: string;
  ratio?: string;
}) {
  const resolved = asset(src);
  if (!resolved) return <Placeholder ratio={ratio} />;
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

function BlockView({ block }: { block: Block }) {
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
          <ImageBlock src={block.src} alt={block.alt} ratio={block.ratio} />
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
            <ImageBlock key={i} src={im.src} alt={im.alt} ratio="1/1" />
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
          <BlockView block={block} />
        </FadeUp>
      ))}
    </div>
  );
}
