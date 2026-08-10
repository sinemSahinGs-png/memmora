"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CoupleHeroSection } from "@/components/CoupleHeroSection";
import { PremiumInviteExperience } from "@/components/invite/PremiumInviteExperience";
import { getMockCoupleBySlug } from "@/lib/mock-data";
import type { Couple } from "@/lib/types";

interface PurchaseLivePreviewProps {
  brideName: string;
  groomName: string;
  weddingDate: string;
}

function buildPreviewCouple(
  brideName: string,
  groomName: string,
  weddingDate: string,
): Couple {
  const base =
    getMockCoupleBySlug("mert-irem") ?? getMockCoupleBySlug("berkin-beste");
  if (!base) {
    throw new Error("Demo couple missing for purchase preview");
  }

  const bride = brideName.trim() || "Gelin";
  const groom = groomName.trim() || "Damat";

  return {
    ...base,
    brideName: bride,
    groomName: groom,
    displayTitle: `${groom} & ${bride}`,
    names: `${groom} & ${bride}`,
    weddingDate: weddingDate || base.weddingDate,
    invitationEnabled: true,
    rsvpEnabled: false,
    status: "active",
    venueName: base.venueName || "Casa Linda Garden",
    venueAddress: base.venueAddress || "Çankaya, Ankara",
    weddingTime: base.weddingTime || "19:00",
  };
}

export function PurchaseLivePreview({
  brideName,
  groomName,
  weddingDate,
}: PurchaseLivePreviewProps) {
  const [tab, setTab] = useState<"page" | "invite">("page");
  const couple = useMemo(
    () => buildPreviewCouple(brideName, groomName, weddingDate),
    [brideName, groomName, weddingDate],
  );

  return (
    <div className="purchase-preview">
      <div className="purchase-preview__tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "page"}
          className={tab === "page" ? "is-active" : ""}
          onClick={() => setTab("page")}
        >
          Düğün sayfası
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "invite"}
          className={tab === "invite" ? "is-active" : ""}
          onClick={() => setTab("invite")}
        >
          E-davetiye
        </button>
      </div>

      <AnimatePresence mode="wait">
        {tab === "page" ? (
          <motion.div
            key={`page-${couple.brideName}-${couple.groomName}-${couple.weddingDate}`}
            className="purchase-preview__stage purchase-preview__stage--page"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="purchase-preview__eyebrow">Canlı düğün sayfası demosu</p>
            <div className="purchase-preview__wedding">
              <CoupleHeroSection
                couple={couple}
                leafCount={128}
                quizLeaderName="Ayşe Y."
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={`invite-${couple.brideName}-${couple.groomName}-${couple.weddingDate}`}
            className="purchase-preview__stage purchase-preview__stage--invite"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="purchase-preview__eyebrow">Gerçek e-davetiye önizleme</p>
            <div className="purchase-preview__invite-shell">
              <PremiumInviteExperience couple={couple} contained />
            </div>
            <p className="purchase-preview__hint">
              Davetiyeyi açarak {couple.brideName} & {couple.groomName} deneyimini
              görebilirsiniz.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
