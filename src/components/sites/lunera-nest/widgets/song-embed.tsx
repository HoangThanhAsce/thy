"use client";

import { useEffect, useState } from "react";

/**
 * The source hides a YouTube player (opacity 0) on top of the drawn player
 * controls, so pressing the gold play button starts the song.
 *
 * When the visitor arrives here from an in-app navigation (envelope or nav
 * click), the page already has user activation, so the song starts by itself.
 * On a direct visit browsers block audible autoplay; the play button still works.
 */
export function SongEmbed({ videoId }: { videoId: string }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const base = `https://www.youtube-nocookie.com/embed/${videoId}?playsinline=1`;
    const activated = navigator.userActivation?.hasBeenActive ?? false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- depends on browser-only state
    setSrc(activated ? `${base}&autoplay=1` : base);
  }, [videoId]);

  if (!src) return null;
  return (
    <iframe
      className="ln-song"
      src={src}
      title="Our graduation song"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      sandbox="allow-same-origin allow-scripts allow-popups allow-presentation"
    />
  );
}
