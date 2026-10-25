import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import type {
  Anim,
  FontKey,
  ImageElement,
  LineElement,
  Paragraph,
  ShapeElement,
  SiteElement,
  TextElement,
  TextRun,
} from "./types";
import { Countdown } from "./widgets/countdown";
import { RsvpForm } from "./widgets/rsvp-form";
import { SongEmbed } from "./widgets/song-embed";

type Vars = CSSProperties & Record<`--${string}`, string | number>;

const FONT_FAMILY: Record<FontKey, string> = {
  // Tinos (metric-compatible with Times) fills the Vietnamese glyphs the Canva cut lacks
  times: '"LN Times New Roman MT", var(--font-ln-vi), "Times New Roman", serif',
  seasons: '"LN The Seasons", serif',
  cooper: '"LN Cooper BT", serif',
  amsterdam3: '"LN Amsterdam Three", cursive',
  amsterdam4: '"LN Amsterdam Four", cursive',
  andasia: '"LN Andasia", cursive',
};

const LETTER_FADE_MS = 700;

function animVars(anim: Anim | undefined): Vars {
  if (!anim) return {};
  return {
    "--delay": `${anim.delay}ms`,
    "--dur": `${anim.duration}ms`,
    ...(anim.distance ? { "--dist": anim.distance } : {}),
  };
}

function rectVars(el: SiteElement): Vars {
  const vars: Vars = {};
  for (const mode of ["d", "t", "m"] as const) {
    const [x, y, w, h] = el.layout[mode];
    vars[`--${mode}x`] = x;
    vars[`--${mode}y`] = y;
    vars[`--${mode}w`] = w;
    vars[`--${mode}h`] = h;
  }
  return {
    ...vars,
    ...(el.rotate ? { "--rot": `${el.rotate}deg` } : {}),
  };
}

function ElementLink({ href, label }: { href: string; label: string }) {
  if (href.startsWith("/")) {
    return <Link className="ln-link" href={href} aria-label={label} />;
  }
  return (
    <a
      className="ln-link"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
    />
  );
}

function ImageBlock({ el }: { el: ImageElement }) {
  const [, , dw] = el.layout.d;
  const [, , mw] = el.layout.m;
  const crop = el.crop;
  const flip = el.flip;
  const sizes = `(max-width: 767px) ${Math.ceil(mw * 1.2)}px, ${Math.ceil(dw)}px`;

  return (
    <div
      className="ln-el"
      data-anim={el.anim?.type}
      style={{ ...rectVars(el), ...animVars(el.anim), filter: el.filter }}
    >
      <div
        className="ln-flip"
        style={{
          ...(flip ? { "--fx": flip[0], "--fy": flip[1] } : {}),
          opacity: el.opacity,
        } as Vars}
      >
        <div
          className="ln-img"
          data-crop={crop ? "" : undefined}
          style={
            crop
              ? ({
                  "--cx": `${crop[0] * 100}%`,
                  "--cy": `${crop[1] * 100}%`,
                  "--cw": `${crop[2] * 100}%`,
                  "--ch": `${crop[3] * 100}%`,
                  ...(el.cropRotate ? { "--crot": `${el.cropRotate}deg` } : {}),
                } as Vars)
              : undefined
          }
        >
          <Image src={el.src} alt={el.alt} fill sizes={sizes} unoptimized draggable={false} />
        </div>
      </div>
      {el.href ? <ElementLink href={el.href} label={el.alt || "Open"} /> : null}
    </div>
  );
}

function ShapeBlock({ el, pulse }: { el: ShapeElement; pulse?: boolean }) {
  const [w, h] = el.size;
  return (
    <div
      className="ln-el"
      data-anim={el.anim?.type}
      style={{ ...rectVars(el), ...animVars(el.anim), filter: el.filter }}
    >
      <div
        className={pulse ? "ln-flip ln-pulse" : "ln-flip"}
        style={{
          ...(el.flip ? { "--fx": el.flip[0], "--fy": el.flip[1] } : {}),
          opacity: el.opacity,
        } as Vars}
      >
        <svg
          className="ln-shape"
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none"
          role={el.alt ? "img" : undefined}
          aria-label={el.alt || undefined}
          aria-hidden={el.alt ? undefined : true}
        >
          {el.layers.map((layer, i) => {
            const clipId = `${el.id}-clip-${i}`;
            const strokeClipId = `${el.id}-stroke-${i}`;
            return (
              <g key={i}>
                {layer.image ? (
                  <>
                    <defs>
                      <clipPath id={clipId}>
                        <path d={layer.path} transform={`scale(${layer.pathScale})`} />
                      </clipPath>
                    </defs>
                    <g clipPath={`url(#${clipId})`}>
                      <image
                        href={layer.image.src}
                        x={layer.image.x * layer.pathScale}
                        y={layer.image.y * layer.pathScale}
                        width={layer.image.w * layer.pathScale}
                        height={layer.image.h * layer.pathScale}
                        // cover the frame's image box, so replacement photos crop instead of stretching
                        preserveAspectRatio="xMidYMid slice"
                      />
                    </g>
                  </>
                ) : layer.fill ? (
                  <path d={layer.path} transform={`scale(${layer.pathScale})`} fill={layer.fill} />
                ) : null}
                {layer.stroke ? (
                  <svg
                    viewBox={layer.stroke.viewBox}
                    width={w}
                    height={h}
                    preserveAspectRatio="none"
                    overflow="hidden"
                  >
                    <defs>
                      <clipPath id={strokeClipId}>
                        <path d={layer.stroke.path} />
                      </clipPath>
                    </defs>
                    <path
                      d={layer.stroke.path}
                      fill="none"
                      stroke={layer.stroke.color}
                      strokeWidth={layer.stroke.width}
                      clipPath={`url(#${strokeClipId})`}
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>
      {el.href ? <ElementLink href={el.href} label={el.alt || "Open"} /> : null}
    </div>
  );
}

function LineBlock({ el }: { el: LineElement }) {
  const [w, h] = el.size;
  return (
    <div className="ln-el" data-anim={el.anim?.type} style={{ ...rectVars(el), ...animVars(el.anim) }}>
      <svg
        className="ln-shape"
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d={el.path}
          fill="none"
          stroke={el.color}
          strokeWidth={el.strokeWidth}
          strokeLinecap={el.linecap}
        />
      </svg>
    </div>
  );
}

function renderText(text: string, letters: { index: number } | null): ReactNode[] {
  const out: ReactNode[] = [];
  text.split("\n").forEach((line, li) => {
    if (li > 0) out.push(<br key={`br-${li}`} />);
    if (!letters) {
      if (line) out.push(line);
      return;
    }
    for (const ch of line) {
      const i = letters.index++;
      out.push(
        <span key={`${li}-${i}`} className="ln-letter" style={{ "--i": i } as Vars}>
          {ch}
        </span>,
      );
    }
  });
  return out;
}

function Run({ run, letters }: { run: TextRun; letters: { index: number } | null }) {
  const style: CSSProperties = {
    color: run.color,
    fontWeight: run.weight,
  };
  const content = renderText(run.text, letters);
  if (run.href) {
    return (
      <a href={run.href} target="_blank" rel="noopener noreferrer" style={style}>
        {content}
      </a>
    );
  }
  return <span style={style}>{content}</span>;
}

function letterCount(paragraphs: Paragraph[]) {
  return paragraphs.reduce(
    (n, p) => n + p.runs.reduce((m, r) => m + [...r.text.replaceAll("\n", "")].length, 0),
    0,
  );
}

function TextBlock({ el }: { el: TextElement }) {
  const { box } = el;
  const isLetters = el.anim?.type === "letters";
  const letters = isLetters ? { index: 0 } : null;
  const count = isLetters ? letterCount(el.paragraphs) : 0;
  const step =
    isLetters && el.anim && count > 1
      ? Math.max(0, (el.anim.duration - LETTER_FADE_MS) / (count - 1))
      : 0;

  return (
    <div
      className="ln-text"
      data-anim={el.anim?.type}
      style={{
        "--bdx": box.d.x,
        "--bdy": box.d.y,
        "--bdk": box.d.k,
        "--btx": box.t.x,
        "--bty": box.t.y,
        "--btk": box.t.k,
        "--bmx": box.m.x,
        "--bmy": box.m.y,
        "--bmk": box.m.k,
        "--bw": box.w,
        "--bh": box.h,
        "--step": `${step}ms`,
        ...animVars(el.anim),
        opacity: el.opacity,
      } as Vars}
    >
      <div
        className="ln-text-inner"
        style={{ "--ox": el.offset[0], "--oy": el.offset[1] } as Vars}
      >
        {el.paragraphs.map((p, i) => (
          <p
            key={i}
            className="ln-p"
            data-nowrap={p.nowrap ? "" : undefined}
            style={{
              fontFamily: FONT_FAMILY[p.font],
              color: p.color,
              textTransform: p.uppercase ? "uppercase" : undefined,
              "--fs": p.size,
              "--lh": p.lineHeight,
              "--ls": p.letterSpacing,
            } as Vars}
          >
            {p.runs.map((run, j) => (
              <Run key={j} run={run} letters={letters} />
            ))}
          </p>
        ))}
      </div>
    </div>
  );
}

function WidgetBlock({ el, children }: { el: SiteElement; children: ReactNode }) {
  return (
    <div className="ln-el" data-anim={el.anim?.type} style={{ ...rectVars(el), ...animVars(el.anim) }}>
      {children}
    </div>
  );
}

/** Elements that keep pulsing after the page settles (the play button). */
const PULSING = new Set(["LBlsmkwrbCJ8RWCy"]);

export function SiteElementView({ el }: { el: SiteElement }) {
  switch (el.kind) {
    case "image":
      return <ImageBlock el={el} />;
    case "shape":
      return <ShapeBlock el={el} pulse={PULSING.has(el.id)} />;
    case "line":
      return <LineBlock el={el} />;
    case "text":
      return <TextBlock el={el} />;
    case "youtube":
      return (
        <WidgetBlock el={el}>
          <SongEmbed videoId="ebhw7Kk1Cbw" />
        </WidgetBlock>
      );
    case "countdown":
      return (
        <WidgetBlock el={el}>
          <Countdown target="2026-11-11T09:00:00+07:00" />
        </WidgetBlock>
      );
    case "rsvp":
      return (
        <WidgetBlock el={el}>
          <RsvpForm />
        </WidgetBlock>
      );
  }
}
