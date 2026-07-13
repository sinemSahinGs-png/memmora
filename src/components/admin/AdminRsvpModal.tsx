"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDisplayDate } from "@/lib/mock-data";
import { exportRsvpCsv } from "@/lib/admin-utils";
import type { RsvpResponse, RsvpStats, RsvpStatus } from "@/lib/types";
import { rsvpStatusLabel } from "@/lib/supabase/rsvp";
import { cn } from "@/lib/utils";

type RsvpListFilter = "attending" | "not_attending" | "maybe" | "all";

interface AdminRsvpModalProps {
  open: boolean;
  coupleSlug: string;
  stats: RsvpStats;
  responses: RsvpResponse[];
  onClose: () => void;
}

const FILTERS: { id: RsvpListFilter; label: string }[] = [
  { id: "attending", label: "Katılanlar" },
  { id: "not_attending", label: "Katılamayanlar" },
  { id: "maybe", label: "Emin Değil" },
  { id: "all", label: "Tümü" },
];

export function AdminRsvpModal({
  open,
  coupleSlug,
  stats,
  responses,
  onClose,
}: AdminRsvpModalProps) {
  const [filter, setFilter] = useState<RsvpListFilter>("attending");

  const filtered = useMemo(() => {
    if (filter === "all") return responses;
    return responses.filter((row) => row.status === filter);
  }, [filter, responses]);

  const handleExport = () => {
    const slug = coupleSlug.replace(/[^a-z0-9-]/gi, "");
    exportRsvpCsv(
      responses.map((row) => ({
        guestName: row.guestName,
        phone: row.phone ?? "",
        status: row.status,
        guestCount: row.guestCount,
        note: row.note ?? "",
        createdAt: row.createdAt,
      })),
      `memoora-${slug}-katilim.csv`
    );
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="admin-rsvp-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-rsvp-modal-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="admin-rsvp-modal__backdrop"
            aria-label="Kapat"
            onClick={onClose}
          />

          <motion.div
            className="admin-rsvp-modal__panel admin-premium-card admin-premium-card--living"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="admin-rsvp-modal__head">
              <div>
                <h2 id="admin-rsvp-modal-title" className="admin-rsvp-modal__title">
                  Katılım Listesi
                </h2>
                <p className="admin-rsvp-modal__summary">
                  {stats.totalGuestCount} gelen kişi · {stats.attendingCount} katılıyor ·{" "}
                  {stats.notAttendingCount} katılamıyor · {stats.maybeCount} emin değil
                </p>
              </div>
              <button
                type="button"
                className="admin-rsvp-modal__close"
                onClick={onClose}
                aria-label="Kapat"
              >
                ×
              </button>
            </header>

            <div className="admin-rsvp-modal__filters">
              {FILTERS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={cn(
                    "admin-rsvp-modal__filter",
                    filter === item.id && "admin-rsvp-modal__filter--active"
                  )}
                  onClick={() => setFilter(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="admin-rsvp-modal__list">
              {filtered.length === 0 ? (
                <p className="admin-rsvp-modal__empty">Henüz yanıt yok.</p>
              ) : (
                filtered.map((row) => (
                  <article key={row.id} className="admin-rsvp-modal__row">
                    <div className="admin-rsvp-modal__row-main">
                      <p className="admin-rsvp-modal__row-name">{row.guestName}</p>
                      <p className="admin-rsvp-modal__row-meta">
                        {row.status === "attending"
                          ? `${row.guestCount} kişi`
                          : rsvpStatusLabel(row.status)}
                        {" · "}
                        {formatDisplayDate(row.createdAt.split("T")[0])}
                      </p>
                      {row.phone ? (
                        <p className="admin-rsvp-modal__row-phone">{row.phone}</p>
                      ) : null}
                      {row.note ? (
                        <p className="admin-rsvp-modal__row-note">Not: {row.note}</p>
                      ) : null}
                    </div>
                  </article>
                ))
              )}
            </div>

            <footer className="admin-rsvp-modal__foot">
              <button
                type="button"
                className="admin-premium-outline-btn admin-premium-outline-btn--sm admin-premium-interactive"
                onClick={handleExport}
                disabled={responses.length === 0}
              >
                Katılım Listesini İndir
              </button>
            </footer>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
