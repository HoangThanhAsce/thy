import Image from "next/image";
import type { CSSProperties } from "react";

import { SiteElementView } from "./elements";
import { RevealController } from "./reveal-controller";
import { SiteNav, type PageKey } from "./site-nav";
import type { PageData, Section } from "./types";

type Vars = CSSProperties & Record<`--${string}`, string | number>;

function SectionView({ section, first }: { section: Section; first: boolean }) {
  const bg = section.backgroundImage;
  return (
    <section
      className="ln-section"
      data-section={section.id}
      data-fill={section.fillViewport ? "" : undefined}
      style={{
        "--h-d": section.height.d,
        "--h-t": section.height.t,
        "--h-m": section.height.m,
        "--bg": section.background,
      } as Vars}
    >
      {bg ? (
        <Image
          className="ln-bg"
          src={bg.src}
          alt=""
          fill
          sizes="100vw"
          unoptimized
          loading={first ? "eager" : "lazy"}
          fetchPriority={first ? "high" : undefined}
          style={{ "--bleed-d": bg.bleed.d, "--bleed-t": bg.bleed.t, "--bleed-m": bg.bleed.m } as Vars}
        />
      ) : null}
      <div className="ln-spacer-top" />
      <div className="ln-stage">
        {section.elements.map((el) => (
          <SiteElementView key={el.id} el={el} />
        ))}
      </div>
      <div className="ln-spacer-bottom" />
    </section>
  );
}

export function CanvaPage({ page, active }: { page: PageData; active: PageKey }) {
  return (
    <div className="ln-root">
      <noscript>
        <style>{".ln-root [data-anim], .ln-root [data-anim] * { animation: none !important; }"}</style>
      </noscript>
      <SiteNav active={active} />
      <main>
        {page.sections.map((section, i) => (
          <SectionView key={section.id} section={section} first={i === 0} />
        ))}
      </main>
      <RevealController />
    </div>
  );
}
