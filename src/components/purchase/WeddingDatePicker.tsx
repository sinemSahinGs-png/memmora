"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  getMinimumWeddingDate,
  toIsoDate,
} from "@/lib/memoora-purchase/pricing";

const WEEKDAYS = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"] as const;
const MONTHS = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
] as const;

interface WeddingDatePickerProps {
  value: string;
  minDate?: string;
  onChange: (isoDate: string) => void;
}

function parseIso(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatLabel(iso: string): string {
  const d = parseIso(iso);
  if (!d) return "Tarih seçin";
  return d.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function WeddingDatePicker({
  value,
  minDate,
  onChange,
}: WeddingDatePickerProps) {
  const min = minDate ?? getMinimumWeddingDate();
  const minParsed = parseIso(min) ?? new Date();
  const selected = parseIso(value);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() =>
    startOfMonth(selected ?? minParsed),
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    setView(startOfMonth(selected ?? minParsed));
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const cells = useMemo(() => {
    const first = startOfMonth(view);
    // Monday-first calendar
    const jsDay = first.getDay(); // 0 Sun
    const offset = (jsDay + 6) % 7;
    const start = new Date(first);
    start.setDate(first.getDate() - offset);

    return Array.from({ length: 42 }, (_, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      const iso = toIsoDate(day);
      const inMonth = day.getMonth() === view.getMonth();
      const disabled = iso < min;
      const isSelected = value === iso;
      const isToday = iso === toIsoDate(new Date());
      return { day, iso, inMonth, disabled, isSelected, isToday };
    });
  }, [view, min, value]);

  const shiftMonth = (delta: number) => {
    setView((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  return (
    <div className="wedding-date-picker" ref={rootRef}>
      <button
        type="button"
        className={`wedding-date-picker__trigger${open ? " is-open" : ""}${value ? " has-value" : ""}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="wedding-date-picker__label">
          {value ? formatLabel(value) : "Takvimden tarih seçin"}
        </span>
        <span className="wedding-date-picker__icon" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect
              x="3"
              y="5"
              width="18"
              height="16"
              rx="3"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <path
              d="M3 10h18M8 3v4M16 3v4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </button>

      {open ? (
        <div
          id={listId}
          className="wedding-date-picker__popover"
          role="dialog"
          aria-label="Düğün tarihi takvimi"
        >
          <div className="wedding-date-picker__nav">
            <button
              type="button"
              aria-label="Önceki ay"
              onClick={() => shiftMonth(-1)}
            >
              ‹
            </button>
            <p>
              {MONTHS[view.getMonth()]} {view.getFullYear()}
            </p>
            <button
              type="button"
              aria-label="Sonraki ay"
              onClick={() => shiftMonth(1)}
            >
              ›
            </button>
          </div>

          <div className="wedding-date-picker__weekdays">
            {WEEKDAYS.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          <div className="wedding-date-picker__grid">
            {cells.map((cell) => (
              <button
                key={cell.iso}
                type="button"
                disabled={cell.disabled}
                className={[
                  "wedding-date-picker__day",
                  cell.inMonth ? "" : "is-outside",
                  cell.isSelected ? "is-selected" : "",
                  cell.isToday ? "is-today" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => {
                  onChange(cell.iso);
                  setOpen(false);
                }}
              >
                {cell.day.getDate()}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
