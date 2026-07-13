"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getCountdownParts,
  padCountdownUnit,
  parseWeddingDateTime,
  type CountdownParts,
} from "@/lib/wedding-countdown";
import styles from "./PremiumInviteExperience.module.css";

interface WeddingCountdownProps {
  weddingDate: string;
  weddingTime?: string;
  className?: string;
}

const UNITS: { key: keyof Pick<CountdownParts, "days" | "hours" | "minutes" | "seconds">; label: string }[] =
  [
    { key: "days", label: "Gün" },
    { key: "hours", label: "Saat" },
    { key: "minutes", label: "Dakika" },
    { key: "seconds", label: "Saniye" },
  ];

export function WeddingCountdown({
  weddingDate,
  weddingTime,
  className,
}: WeddingCountdownProps) {
  const target = useMemo(
    () => parseWeddingDateTime(weddingDate, weddingTime),
    [weddingDate, weddingTime]
  );

  const [mounted, setMounted] = useState(false);
  const [parts, setParts] = useState<CountdownParts | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !target) {
      setParts(null);
      return;
    }

    const tick = () => setParts(getCountdownParts(target));
    tick();

    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target, mounted]);

  if (!target) return null;

  const rootClass = [styles.countdown, className].filter(Boolean).join(" ");

  if (mounted && parts?.isPast) {
    return (
      <div className={rootClass} role="timer" aria-live="polite">
        <p className={styles.countdownCelebration}>
          {parts.isWeddingDay ? "Bugün büyük gün!" : "Düğün günü geldi!"}
        </p>
      </div>
    );
  }

  return (
    <div className={rootClass} role="timer" aria-live="polite">
      <p className={styles.countdownLabel}>Düğüne kalan süre</p>
      <div className={styles.countdownGrid}>
        {UNITS.map(({ key, label }) => (
          <div key={key} className={styles.countdownUnit}>
            <span className={styles.countdownValue} aria-hidden>
              {mounted && parts ? padCountdownUnit(parts[key]) : "--"}
            </span>
            <span className={styles.countdownUnitLabel}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
