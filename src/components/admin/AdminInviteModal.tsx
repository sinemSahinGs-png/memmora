"use client";

import { motion, AnimatePresence } from "framer-motion";
import { buildCoupleInviteUrl } from "@/lib/site-url";
import { IconEnvelopePremium } from "./premium/AdminPremiumIcons";

interface AdminInviteModalProps {
  open: boolean;
  coupleSlug: string;
  coupleTitle: string;
  onClose: () => void;
  onCopied?: () => void;
}

export function AdminInviteModal({
  open,
  coupleSlug,
  coupleTitle,
  onClose,
  onCopied,
}: AdminInviteModalProps) {
  const inviteUrl = buildCoupleInviteUrl(coupleSlug);
  const shareText = `${coupleTitle} düğün davetiyesi için katılımınızı buradan bildirebilirsiniz: ${inviteUrl}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      onCopied?.();
    } catch {
      onCopied?.();
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="admin-invite-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-invite-modal-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="admin-invite-modal__backdrop"
            aria-label="Kapat"
            onClick={onClose}
          />

          <motion.div
            className="admin-invite-modal__panel admin-premium-card admin-premium-card--living"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="admin-invite-modal__head">
              <div className="admin-invite-modal__icon-wrap" aria-hidden>
                <IconEnvelopePremium />
              </div>
              <div>
                <h2 id="admin-invite-modal-title" className="admin-invite-modal__title">
                  E-Davetiye
                </h2>
                <p className="admin-invite-modal__subtitle">
                  Düğün öncesi katılım linkiniz
                </p>
              </div>
              <button
                type="button"
                className="admin-invite-modal__close"
                onClick={onClose}
                aria-label="Kapat"
              >
                ×
              </button>
            </header>

            <div className="admin-invite-modal__link-card">
              <p className="admin-invite-modal__link-label">Paylaşım linki</p>
              <p className="admin-invite-modal__link-url">{inviteUrl}</p>
            </div>

            <div className="admin-invite-modal__actions">
              <button
                type="button"
                className="admin-premium-outline-btn admin-premium-outline-btn--sm admin-premium-interactive admin-invite-modal__action"
                onClick={() => void copyLink()}
              >
                Linki Kopyala
              </button>
              <a
                href={inviteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-premium-outline-btn admin-premium-outline-btn--sm admin-premium-interactive admin-invite-modal__action admin-invite-modal__action--primary"
              >
                E-Davetiyeye Git
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-premium-outline-btn admin-premium-outline-btn--sm admin-premium-interactive admin-invite-modal__action admin-premium-outline-btn--whatsapp"
              >
                WhatsApp&apos;ta Paylaş
              </a>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
