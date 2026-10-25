"use client";

import { useEffect, useState } from "react";

interface Parts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function partsUntil(target: number, now: number): Parts {
  const total = Math.max(0, Math.floor((target - now) / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Rebuild of the tickcounter.com widget the source embeds (countdown 10403780,
 * counting to 2027-07-01 00:00 America/Los_Angeles and stopping at zero).
 */
export function Countdown({ target }: { target: string }) {
  const targetMs = Date.parse(target);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const parts = now === null ? null : partsUntil(targetMs, now);
  const cells: Array<{ value: string; label: string; accent?: boolean }> = [
    { value: parts ? String(parts.days) : "--", label: "DAYS" },
    { value: parts ? pad(parts.hours) : "--", label: "HOURS" },
    { value: parts ? pad(parts.minutes) : "--", label: "MINUTES" },
    { value: parts ? pad(parts.seconds) : "--", label: "SECONDS", accent: true },
  ];

  return (
    <div className="ln-countdown" role="timer" aria-label="Countdown to graduation">
      <div className="ln-countdown-row">
        {cells.map((cell, i) => (
          <div key={cell.label} className="ln-countdown-group">
            {i > 0 ? <span className="ln-countdown-colon">:</span> : null}
            <span className="ln-countdown-cell">
              <span className="ln-countdown-value" data-accent={cell.accent ? "" : undefined}>
                {cell.value}
              </span>
              <span className="ln-countdown-label">{cell.label}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
