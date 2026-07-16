"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AdminPinLoginScreen } from "./admin/AdminPinLoginScreen";
import { MemoryGardenBackground } from "./memory-mirror/MemoryGardenBackground";
import { AdminCoupleSettings } from "./admin/AdminCoupleSettings";
import { AdminCoupleGallery } from "./admin/AdminCoupleGallery";
import { AdminGuestMemoriesGrid } from "./admin/AdminGuestMemoriesGrid";
import { AdminQuizManager } from "./admin/AdminQuizManager";
import { AdminAftermoviePanel } from "./admin/AdminAftermoviePanel";
import { AdminContributionActionModal } from "./admin/AdminContributionActionModal";
import { AdminRsvpModal } from "./admin/AdminRsvpModal";
import { AdminInviteModal } from "./admin/AdminInviteModal";
import { AdminPremiumShell } from "./admin/premium/AdminPremiumShell";
import { AdminPremiumHeader } from "./admin/premium/AdminPremiumHeader";
import { AdminPremiumStats } from "./admin/premium/AdminPremiumStats";
import { AdminPremiumQuizCard } from "./admin/premium/AdminPremiumQuizCard";
import {
  AdminPremiumBottomNav,
  AdminPremiumTabNav,
} from "./admin/premium/AdminPremiumTabNav";
import { AdminPremiumOverview } from "./admin/premium/AdminPremiumOverview";
import { AdminPremiumMessageRow } from "./admin/premium/AdminPremiumMessageRow";
import { AdminPremiumTabPanel } from "./admin/premium/AdminPremiumTabPanel";
import type { AdminPremiumTab, AdminSettingsPanel } from "./admin/premium/admin-premium-types";
import type { Couple, RsvpResponse, RsvpStats } from "@/lib/types";
import {
  fetchContributionsWithMedia,
  hideContribution,
  permanentlyDeleteContribution,
} from "@/lib/supabase/contributions";
import { fetchLeafCount } from "@/lib/supabase/couples";
import {
  fetchQuizQuestionCount,
  fetchQuizAttempts,
  fetchQuizParticipantCount,
  fetchQuizLeader,
  type QuizLeader,
} from "@/lib/supabase/quiz";
import { fetchCouplePhotoAdminCount } from "@/lib/supabase/couple-photos";
import {
  computeRsvpStats,
  fetchRsvpResponses,
} from "@/lib/supabase/rsvp";
import type { ContributionWithMedia } from "@/lib/supabase/database.types";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  computeMediaStats,
  exportContributionsCsv,
  exportMemoriesListCsv,
  exportQuizAttemptsCsv,
  filterContributions,
  type AdminContributionFilter,
} from "@/lib/admin-utils";
import { getCoupleDisplayTitle } from "@/lib/couple-utils";
import { buildCouplePublicUrl, buildCoupleQuizUrl } from "@/lib/site-url";
import {
  clearAdminSession,
  getCoupleAdminSessionKey,
  isAdminSessionActive,
  setAdminSessionActive,
} from "@/lib/admin-session";
import { cn } from "@/lib/utils";

interface AdminPanelProps {
  couple: Couple;
  coupleAdminPin?: string | null;
}

const FILTERS: { id: AdminContributionFilter; label: string }[] = [
  { id: "all", label: "Tümü" },
  { id: "with-media", label: "Medyalı" },
  { id: "message-only", label: "Sadece Mesaj" },
];

export function AdminPanel({
  couple: initialCouple,
  coupleAdminPin,
}: AdminPanelProps) {
  const [couple, setCouple] = useState(initialCouple);
  const [tab, setTab] = useState<AdminPremiumTab>("leaves");
  const [settingsPanel, setSettingsPanel] = useState<AdminSettingsPanel>("main");
  const [showAllLeaves, setShowAllLeaves] = useState(false);
  const [pin, setPin] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [contributions, setContributions] = useState<ContributionWithMedia[]>([]);
  const [leafCount, setLeafCount] = useState(0);
  const [quizQuestionCount, setQuizQuestionCount] = useState(0);
  const [quizParticipantCount, setQuizParticipantCount] = useState(0);
  const [quizLeader, setQuizLeader] = useState<QuizLeader | null>(null);
  const [couplePhotoCount, setCouplePhotoCount] = useState(0);
  const [rsvpStats, setRsvpStats] = useState<RsvpStats>({
    totalGuestCount: 0,
    totalResponses: 0,
    attendingCount: 0,
    notAttendingCount: 0,
    maybeCount: 0,
  });
  const [rsvpResponses, setRsvpResponses] = useState<RsvpResponse[]>([]);
  const [rsvpModalOpen, setRsvpModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionTargetId, setActionTargetId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<AdminContributionFilter>("all");
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const galleryHeroRef = useRef<HTMLElement>(null);

  const fallbackPin = process.env.NEXT_PUBLIC_ADMIN_PIN ?? "0606";
  const adminPin = coupleAdminPin?.trim() || fallbackPin;
  const displayTitle = getCoupleDisplayTitle(couple);
  const publicUrl = buildCouplePublicUrl(couple.slug);
  const quizPublicUrl = buildCoupleQuizUrl(couple.slug);

  const adminSessionKey = getCoupleAdminSessionKey(couple.slug);

  const pendingActionItem = useMemo(
    () => contributions.find((item) => item.id === pendingActionId) ?? null,
    [contributions, pendingActionId]
  );

  const loadData = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    setLoading(true);
    try {
      const [rows, count, quizCount, photoCount, rsvpRows, quizParticipants, leader] =
        await Promise.all([
        fetchContributionsWithMedia(couple.id),
        fetchLeafCount(couple.id),
        fetchQuizQuestionCount(couple.id).catch(() => 0),
        fetchCouplePhotoAdminCount(couple.id).catch(() => 0),
        fetchRsvpResponses(couple.id).catch(() => []),
        fetchQuizParticipantCount(couple.id).catch(() => 0),
        fetchQuizLeader(couple.id).catch(() => null),
      ]);
      setContributions(rows);
      setLeafCount(count);
      setQuizQuestionCount(quizCount);
      setCouplePhotoCount(photoCount);
      setQuizParticipantCount(quizParticipants);
      setQuizLeader(leader);
      setRsvpResponses(rsvpRows);
      setRsvpStats(computeRsvpStats(rsvpRows));
    } finally {
      setLoading(false);
    }
  }, [couple.id]);

  useEffect(() => {
    let cancelled = false;
    const restore = async () => {
      const local = isAdminSessionActive(adminSessionKey);
      if (!local) {
        if (!cancelled) {
          setAuthenticated(false);
          setAuthReady(true);
        }
        return;
      }
      // sessionStorage alone is not enough — require signed HttpOnly cookie
      try {
        const res = await fetch(
          `/api/couples/${couple.slug}/admin/session`,
          { credentials: "same-origin" },
        );
        if (!cancelled) {
          if (res.ok) {
            setAuthenticated(true);
          } else {
            clearAdminSession(adminSessionKey);
            setAuthenticated(false);
          }
          setAuthReady(true);
        }
      } catch {
        if (!cancelled) {
          clearAdminSession(adminSessionKey);
          setAuthenticated(false);
          setAuthReady(true);
        }
      }
    };
    void restore();
    return () => {
      cancelled = true;
    };
  }, [adminSessionKey, couple.slug]);

  useEffect(() => {
    if (authenticated) loadData();
  }, [authenticated, loadData]);

  useEffect(() => {
    if (tab !== "settings") setSettingsPanel("main");
  }, [tab]);

  useEffect(() => {
    if (tab !== "leaves") setShowAllLeaves(false);
  }, [tab]);

  const scrollToGalleryHero = useCallback(() => {
    const hero = galleryHeroRef.current;
    if (!hero) return;

    const offset = 20;
    const top = hero.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (tab !== "gallery") return;

    const timer = window.setTimeout(scrollToGalleryHero, 150);
    return () => window.clearTimeout(timer);
  }, [tab, scrollToGalleryHero]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const mediaStats = useMemo(
    () => computeMediaStats(contributions),
    [contributions]
  );

  const filteredContributions = useMemo(
    () => filterContributions(contributions, filter, searchQuery),
    [contributions, filter, searchQuery]
  );

  const showToast = (message: string) => setToast(message);

  const copyPublicUrl = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      showToast("Link kopyalandı");
    } catch {
      showToast("Kopyalama başarısız");
    }
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin !== adminPin) {
      setPinError(true);
      return;
    }
    try {
      const res = await fetch(`/api/couples/${couple.slug}/admin/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) {
        setPinError(true);
        return;
      }
      setAdminSessionActive(adminSessionKey);
      setAuthenticated(true);
      setPinError(false);
      setPin("");
    } catch {
      setPinError(true);
    }
  };

  const handleHideContribution = async () => {
    if (!pendingActionId) return;
    setActionLoading(true);
    setActionTargetId(pendingActionId);
    try {
      await hideContribution(pendingActionId);
      setPendingActionId(null);
      await loadData();
      showToast("Mesaj gizlendi");
    } catch {
      showToast("Gizleme başarısız");
    } finally {
      setActionLoading(false);
      setActionTargetId(null);
    }
  };

  const handleDeleteContribution = async () => {
    if (!pendingActionId) return;
    setActionLoading(true);
    setActionTargetId(pendingActionId);
    try {
      await permanentlyDeleteContribution(pendingActionId);
      setPendingActionId(null);
      await loadData();
      showToast("Mesaj silindi");
    } catch {
      showToast("Silme başarısız");
    } finally {
      setActionLoading(false);
      setActionTargetId(null);
    }
  };

  const handleExportNotes = () => {
    const slug = couple.slug.replace(/[^a-z0-9-]/gi, "");
    exportContributionsCsv(filteredContributions, `memoora-${slug}-notlar.csv`, {
      includeDriveUrls: false,
      coupleSlug: couple.slug,
    });
    showToast("Notlar indirildi");
  };

  const handleExportMemoriesList = () => {
    const slug = couple.slug.replace(/[^a-z0-9-]/gi, "");
    exportMemoriesListCsv(
      contributions,
      couple.slug,
      `memoora-${slug}-ani-listesi.csv`
    );
    showToast("Anı listesi indirildi");
  };

  const handleExportQuiz = async () => {
    try {
      const attempts = await fetchQuizAttempts(couple.id);
      const slug = couple.slug.replace(/[^a-z0-9-]/gi, "");
      exportQuizAttemptsCsv(
        attempts.map((a) => ({
          participantName: a.participant_name,
          score: a.score,
          totalQuestions: a.total_questions,
          createdAt: a.created_at,
        })),
        `memoora-${slug}-quiz.csv`
      );
      showToast("Quiz sonuçları indirildi");
    } catch {
      showToast("Quiz sonuçları indirilemedi");
    }
  };

  const handleSettingsSaved = (updated: Couple) => {
    setCouple(updated);
    if (updated.slug !== couple.slug) {
      window.location.href = `/${updated.slug}/admin`;
    }
  };

  const openQuizManager = () => {
    setSettingsPanel("main");
    setTab("quiz");
  };

  const openQuizQuestions = () => {
    setSettingsPanel("main");
    setTab("quiz");
    window.setTimeout(() => {
      document
        .getElementById("quiz-questions")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 180);
  };

  const openSettings = () => {
    setSettingsPanel("main");
    setTab("settings");
  };

  const navigateTab = useCallback((nextTab: AdminPremiumTab) => {
    setSettingsPanel("main");
    setTab(nextTab);
  }, []);

  const activePanelKey =
    tab === "leaves"
      ? showAllLeaves
        ? "leaves-all"
        : "leaves-preview"
      : tab === "settings"
        ? "settings"
        : tab;

  const renderTabContent = () => {
    if (tab === "leaves" && !showAllLeaves) {
      return (
        <AdminPremiumOverview
          contributions={contributions}
          guestUrl={publicUrl}
          coupleSlug={couple.slug}
          onViewAllLeaves={() => setShowAllLeaves(true)}
          onExportCsv={handleExportNotes}
          onNavigate={navigateTab}
          onCopyGuestLink={copyPublicUrl}
        />
      );
    }

    if (tab === "leaves" && showAllLeaves) {
      return (
        <div className="admin-premium-panel">
          <div className="admin-premium-toolbar">
            <button
              type="button"
              onClick={() => setShowAllLeaves(false)}
              className="admin-premium-text-link admin-premium-toolbar__back admin-premium-interactive"
            >
              ← Özet
            </button>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Misafir adı veya yaprak ara…"
              className="admin-premium-toolbar__search"
            />
            <div className="admin-premium-toolbar__filters">
              {FILTERS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  className={cn(
                    "admin-premium-filter-btn admin-premium-interactive",
                    filter === item.id && "admin-premium-filter-btn--active"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className="admin-premium-toolbar__meta">
              {filteredContributions.length === contributions.length
                ? `${contributions.length} yaprak`
                : `${filteredContributions.length} / ${contributions.length} yaprak`}
            </p>
          </div>

          {loading ? (
            <div className="admin-premium-card admin-premium-card--living">
              <p className="admin-premium-empty">Yapraklar yükleniyor…</p>
            </div>
          ) : filteredContributions.length === 0 ? (
            <div className="admin-premium-card admin-premium-card--living">
              <p className="admin-premium-empty">Henüz yaprak yok.</p>
            </div>
          ) : (
            <div className="admin-premium-card admin-premium-messages-card admin-premium-card--living">
              <div className="admin-premium-message-list">
                {filteredContributions.map((item) => (
                  <AdminPremiumMessageRow
                    key={item.id}
                    item={item}
                    coupleSlug={couple.slug}
                    onManage={() => setPendingActionId(item.id)}
                    managing={
                      actionLoading &&
                      (actionTargetId === item.id || pendingActionId === item.id)
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (tab === "memories") {
      return (
        <div className="admin-premium-panel admin-premium-subpanel admin-memories-tab">
          <section className="admin-memories-tab-section admin-premium-reveal">
            <header className="admin-memories-tab-section__head">
              <h2 className="admin-premium-card__title">Anılarımız</h2>
              <p className="admin-memories-tab-section__desc">
                Public sayfanızda memories frame içinde gösterilecek özel
                fotoğraflarınızı buradan yönetin.
              </p>
            </header>
            <AdminCoupleGallery
              couple={couple}
              onCoupleUpdated={handleSettingsSaved}
            />
          </section>
        </div>
      );
    }

    if (tab === "gallery") {
      return (
        <div className="admin-premium-panel admin-premium-subpanel admin-guest-gallery-tab">
          <AdminGuestMemoriesGrid
            contributions={contributions}
            coupleSlug={couple.slug}
            heroRef={galleryHeroRef}
            loading={loading}
          />
        </div>
      );
    }

    if (tab === "film") {
      return (
        <div className="admin-premium-panel admin-premium-subpanel admin-film-tab">
          <AdminAftermoviePanel
            couple={couple}
            contributions={contributions}
            onToast={showToast}
            onOpenGallery={() => setTab("gallery")}
            onSessionExpired={() => {
              clearAdminSession(adminSessionKey);
              setAuthenticated(false);
              showToast("Oturum sona erdi. Lütfen PIN ile tekrar giriş yapın.");
            }}
          />
        </div>
      );
    }

    if (tab === "quiz") {
      return (
        <div className="admin-premium-panel admin-premium-subpanel admin-quiz-tab">
          <header className="admin-quiz-tab__head admin-premium-reveal">
            <h2 className="admin-premium-card__title">Quiz Yönetimi</h2>
            <p className="admin-quiz-tab__desc">
              Soruları ve misafir skorlarını buradan yönetin.
            </p>
            <button
              type="button"
              className="admin-quiz-tab__edit-btn admin-premium-outline-btn admin-premium-outline-btn--sm admin-premium-interactive"
              onClick={() => {
                document
                  .getElementById("quiz-questions")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              Quiz sorularını düzenle
            </button>
          </header>
          <AdminQuizManager
            premium
            couple={couple}
            onCoupleUpdated={handleSettingsSaved}
          />
        </div>
      );
    }

    if (tab === "settings") {
      return (
        <div className="admin-premium-panel admin-premium-subpanel admin-premium-subpanel--settings">
          <AdminCoupleSettings
            couple={couple}
            onSaved={handleSettingsSaved}
            onExportNotes={handleExportNotes}
            onExportQuiz={handleExportQuiz}
            onExportMemories={handleExportMemoriesList}
            onManageQuiz={openQuizManager}
          />
        </div>
      );
    }

    return null;
  };

  if (!isSupabaseConfigured()) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fcf9f5] px-6 text-center">
        <p className="text-sm font-medium text-[#8a7d6b]">
          Supabase yapılandırılmamış. .env.local dosyasını kontrol edin.
        </p>
      </main>
    );
  }

  if (!authReady) {
    return (
      <main className="admin-pin-screen admin-pin-screen--checking">
        <MemoryGardenBackground className="admin-pin-screen__bg" />
        <div className="admin-pin-screen__shade" aria-hidden />
      </main>
    );
  }

  if (!authenticated) {
    return (
      <AdminPinLoginScreen
        eyebrow="Memoora Admin"
        title={displayTitle}
        subtitle="Yönetim paneline erişmek için PIN girin."
        pin={pin}
        pinError={pinError}
        onPinChange={setPin}
        onSubmit={handlePinSubmit}
      />
    );
  }

  return (
    <AdminPremiumShell>
      <AdminPremiumHeader
        couple={couple}
        publicUrl={publicUrl}
        quizQuestionCount={quizQuestionCount}
        couplePhotoCount={couplePhotoCount}
        onSettingsClick={openSettings}
        onInviteClick={() => setInviteModalOpen(true)}
        onGalleryClick={() => {
          if (tab !== "gallery") {
            navigateTab("gallery");
          }
          window.setTimeout(scrollToGalleryHero, 150);
        }}
        onNavigateMemories={() => navigateTab("memories")}
        onNavigateQuiz={openQuizManager}
      />

      <AnimatePresence initial={false}>
        {tab === "leaves" ? (
          <motion.div
            key="admin-premium-stats"
            className="admin-premium-stats-shell"
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          >
            <AdminPremiumStats
              leafCount={leafCount}
              rsvpGuestCount={rsvpStats.totalGuestCount}
              rsvpResponseCount={rsvpStats.totalResponses}
              onNavigate={(nextTab) => navigateTab(nextTab)}
              onRsvpClick={() => setRsvpModalOpen(true)}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {tab === "leaves" && !showAllLeaves ? (
        <div className="admin-premium-quiz-card-shell">
          <AdminPremiumQuizCard
            quizEnabled={couple.quizEnabled}
            quizQuestionCount={quizQuestionCount}
            participantCount={quizParticipantCount}
            leader={quizLeader}
            quizPublicUrl={quizPublicUrl}
            onManageQuiz={openQuizManager}
            onEditQuestions={openQuizQuestions}
          />
        </div>
      ) : null}

      <div className="admin-premium-body" data-tab={tab}>
        <AdminPremiumTabNav
          activeTab={tab}
          onChange={(nextTab) => navigateTab(nextTab)}
        />

        <AdminPremiumTabPanel panelKey={activePanelKey}>
          {renderTabContent()}
        </AdminPremiumTabPanel>
      </div>

      {toast ? <p className="admin-premium-toast">{toast}</p> : null}

      <AdminPremiumBottomNav
        activeTab={tab}
        onChange={(nextTab) => navigateTab(nextTab)}
      />

      <AdminContributionActionModal
        open={pendingActionId !== null}
        guestName={pendingActionItem?.guest_name ?? "Misafir"}
        loading={actionLoading}
        onHide={handleHideContribution}
        onDelete={handleDeleteContribution}
        onCancel={() => {
          if (!actionLoading) setPendingActionId(null);
        }}
      />

      <AdminRsvpModal
        open={rsvpModalOpen}
        coupleSlug={couple.slug}
        stats={rsvpStats}
        responses={rsvpResponses}
        onClose={() => setRsvpModalOpen(false)}
      />

      <AdminInviteModal
        open={inviteModalOpen}
        coupleSlug={couple.slug}
        coupleTitle={displayTitle}
        onClose={() => setInviteModalOpen(false)}
        onCopied={() => showToast("Davetiye linki kopyalandı")}
      />
    </AdminPremiumShell>
  );
}
