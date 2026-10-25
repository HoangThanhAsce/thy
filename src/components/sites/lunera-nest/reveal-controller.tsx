"use client";

import { useEffect } from "react";

/**
 * Plays each section's entrance animations the first time it scrolls into view,
 * matching Canva's per-section trigger. Animations wait for the web fonts so the
 * text wipes reveal the final glyphs.
 */
export function RevealController() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".ln-root");
    if (!root) return;

    let observer: IntersectionObserver | null = null;
    let cancelled = false;

    document.fonts.ready.then(() => {
      if (cancelled) return;
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.setAttribute("data-in", "");
            observer?.unobserve(entry.target);
          }
        },
        { threshold: 0 },
      );
      root.querySelectorAll("[data-section]").forEach((section) => observer?.observe(section));
    });

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, []);

  return null;
}
