"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface SongContextValue {
  playing: boolean;
  toggle: () => void;
}

const SongContext = createContext<SongContextValue | null>(null);

/** Pages where the song should start on the visitor's first tap. */
const SONG_PAGE = /\/page-2\/?$/;

/**
 * Plays the graduation song with a page-level <audio> element. It lives in the
 * route layout, so the music keeps going while moving between the two pages.
 *
 * Mobile browsers only allow audible playback that starts inside a user gesture,
 * so playback begins in the click/tap that opens page 2 (envelope or nav link),
 * or on the first tap anywhere on page 2 when the page was opened directly.
 */
export function SongProvider({ src, children }: { src: string; children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const userPausedRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const pathname = usePathname();
  const onSongPage = SONG_PAGE.test(pathname);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.paused) return;
    audio.play().catch(() => {
      // blocked without a user gesture; the next tap will retry
    });
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      userPausedRef.current = false;
      play();
    } else {
      userPausedRef.current = true;
      audio.pause();
    }
  }, [play]);

  // Start inside the gesture of any click on a link that opens page 2.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (!link) return;
      const url = new URL(link.getAttribute("href") ?? "", location.href);
      if (url.origin === location.origin && SONG_PAGE.test(url.pathname)) play();
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [play]);

  // Direct visits to page 2: start on the first tap, unless the visitor paused it.
  useEffect(() => {
    if (!onSongPage) return;
    const onGesture = (event: Event) => {
      if ((event.target as Element | null)?.closest?.(".ln-song-toggle")) return;
      if (!userPausedRef.current) play();
    };
    const events = ["click", "touchend", "keydown"] as const;
    events.forEach((type) => document.addEventListener(type, onGesture, true));
    return () => events.forEach((type) => document.removeEventListener(type, onGesture, true));
  }, [onSongPage, play]);

  return (
    <SongContext.Provider value={{ playing, toggle }}>
      {children}
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        loop
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
    </SongContext.Provider>
  );
}

/** Invisible button over the drawn player controls (the source used a hidden YouTube player there). */
export function SongToggle() {
  const song = useContext(SongContext);
  if (!song) return null;
  return (
    <button
      type="button"
      className="ln-song-toggle"
      aria-label={song.playing ? "Pause our graduation song" : "Play our graduation song"}
      aria-pressed={song.playing}
      onClick={song.toggle}
    />
  );
}
