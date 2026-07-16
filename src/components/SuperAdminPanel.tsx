"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminPinLoginScreen } from "./admin/AdminPinLoginScreen";
import { MemoryGardenBackground } from "./memory-mirror/MemoryGardenBackground";
import { GoldButton } from "./GoldButton";
import { AdminConfirmModal } from "./admin/AdminConfirmModal";
import { SuperAdminCoupleList } from "./super-admin/SuperAdminCoupleList";
import { SuperAdminOrdersTab } from "./super-admin/SuperAdminOrdersTab";
import { SuperAdminCoupleForm } from "./super-admin/SuperAdminCoupleForm";
import { SuperAdminAftermoviePanel } from "./super-admin/SuperAdminAftermoviePanel";
import type { Couple, CoupleCreateInput, CoupleListItem } from "@/lib/types";
import {
  createCouple,
  deleteCouple,
  fetchAllCouplesList,
  fetchCoupleById,
  setCoupleStatus,
  updateCoupleById,
} from "@/lib/supabase/couples";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { provisionCoupleDriveFolder } from "@/lib/provision-drive-folder-client";
import {
  formatShareSaveMessage,
  shareCoupleDriveFolder,
} from "@/lib/share-drive-folder-client";
import { cn } from "@/lib/utils";
import {
  getSuperAdminSessionKey,
  isAdminSessionActive,
  setAdminSessionActive,
} from "@/lib/admin-session";

type View = "list" | "create" | "edit";
type MainTab = "couples" | "orders" | "aftermovie";
type StatusFilter = "all" | "active" | "passive" | "archived";

export function SuperAdminPanel() {
  const [pin, setPin] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [couples, setCouples] = useState<CoupleListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<View>("list");
  const [mainTab, setMainTab] = useState<MainTab>("couples");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingCouple, setEditingCouple] = useState<Couple | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortByDate, setSortByDate] = useState<"desc" | "asc">("desc");
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingDeleteSlug, setPendingDeleteSlug] = useState<string | null>(null);
  const [deleteSlugConfirm, setDeleteSlugConfirm] = useState("");
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);
  const [deleting, setDeleting] = useState(false);

  const superAdminPin = process.env.NEXT_PUBLIC_SUPER_ADMIN_PIN ?? "9999";
  const adminSessionKey = getSuperAdminSessionKey();

  const loadCouples = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    setLoading(true);
    try {
      const data = await fetchAllCouplesList();
      setCouples(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Çiftler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setAuthenticated(isAdminSessionActive(adminSessionKey));
    setAuthReady(true);
  }, [adminSessionKey]);

  useEffect(() => {
    if (authenticated) loadCouples();
  }, [authenticated, loadCouples]);

  const filteredCouples = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = [...couples];

    if (q) {
      list = list.filter(
        (c) =>
          c.displayTitle.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q) ||
          c.names.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      list = list.filter((c) => c.status === statusFilter);
    }

    list.sort((a, b) => {
      const da = a.weddingDate || a.createdAt;
      const db = b.weddingDate || b.createdAt;
      return sortByDate === "desc"
        ? db.localeCompare(da)
        : da.localeCompare(db);
    });

    return list;
  }, [couples, search, statusFilter, sortByDate]);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin !== superAdminPin) {
      setPinError(true);
      return;
    }
    try {
      const res = await fetch("/api/admin/session", {
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

  const openCreate = () => {
    setEditingId(null);
    setEditingCouple(null);
    setView("create");
    setError(null);
    setMessage(null);
  };

  const openEdit = async (id: string) => {
    setError(null);
    setMessage(null);
    try {
      const couple = await fetchCoupleById(id, { includeAdminPin: true });
      if (!couple) {
        setError("Çift bulunamadı.");
        return;
      }
      setEditingId(id);
      setEditingCouple(couple);
      setView("edit");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Çift yüklenemedi.");
    }
  };

  const handleFormSubmit = async (input: CoupleCreateInput) => {
    setFormLoading(true);
    setError(null);
    setMessage(null);

    const result =
      view === "edit" && editingId
        ? await updateCoupleById(editingId, input)
        : await createCouple(input);

    setFormLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    if (view === "edit") {
      const hasEmails =
        Boolean(input.brideEmail?.trim()) || Boolean(input.groomEmail?.trim());

      if (hasEmails) {
        const share = await shareCoupleDriveFolder(result.couple.slug, {
          brideEmail: input.brideEmail,
          groomEmail: input.groomEmail,
        });
        setMessage(formatShareSaveMessage(share, true, "Çift", "güncellendi"));
      } else {
        setMessage("Çift güncellendi.");
      }
    } else {
      const drive = await provisionCoupleDriveFolder(result.couple.slug);
      if (drive.ok) {
        setMessage(
          drive.created
            ? "Yeni çift oluşturuldu. Google Drive klasörü açıldı."
            : "Yeni çift oluşturuldu. Drive klasörü zaten mevcuttu."
        );
      } else {
        setMessage(
          `Yeni çift oluşturuldu. Drive klasörü açılamadı: ${drive.error ?? "bilinmeyen hata"}`
        );
      }
    }

    setView("list");
    setEditingId(null);
    setEditingCouple(null);
    await loadCouples();
  };

  const handleToggleStatus = async (id: string, current: CoupleListItem["status"]) => {
    const next =
      current === "active"
        ? "passive"
        : current === "passive"
          ? "active"
          : "active";
    const result = await setCoupleStatus(id, next);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setMessage(next === "active" ? "Çift aktifleştirildi." : "Çift pasifleştirildi.");
    await loadCouples();
  };

  const openDeleteFlow = (id: string, slug: string) => {
    setPendingDeleteId(id);
    setPendingDeleteSlug(slug);
    setDeleteSlugConfirm("");
    setDeleteStep(1);
  };

  const handleDelete = async () => {
    if (!pendingDeleteId || !pendingDeleteSlug) return;

    if (deleteStep === 1) {
      setDeleteStep(2);
      return;
    }

    if (deleteSlugConfirm.trim() !== pendingDeleteSlug) {
      setError("Slug eşleşmiyor. Kalıcı silme iptal edildi.");
      setPendingDeleteId(null);
      setPendingDeleteSlug(null);
      setDeleteStep(1);
      return;
    }

    setDeleting(true);
    const result = await deleteCouple(pendingDeleteId);
    setDeleting(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setPendingDeleteId(null);
    setPendingDeleteSlug(null);
    setDeleteStep(1);
    setMessage("Çift kalıcı olarak silindi.");
    await loadCouples();
  };

  if (!isSupabaseConfigured()) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-center">
        <p className="text-sm text-white/50">
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
        eyebrow="Memoora Yönetim Paneli"
        title="Super Admin"
        subtitle="Tüm çiftleri yönetmek için PIN girin."
        pin={pin}
        pinError={pinError}
        onPinChange={setPin}
        onSubmit={handlePinSubmit}
      />
    );
  }

  return (
    <main className="super-admin-page">
      <div className="super-admin-inner">
        <header className="super-admin-header">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-champagne/70">
              Memoora Yönetim Paneli
            </p>
            <h1 className="mt-1 font-serif text-2xl text-white/95 sm:text-3xl">
              {mainTab === "orders"
                ? "Siparişler"
                : mainTab === "aftermovie"
                  ? "MEMOORA AFTER"
                  : "Tüm Çiftler"}
            </h1>
          </div>
          {mainTab === "couples" && view === "list" ? (
            <GoldButton type="button" variant="primary" className="!text-[10px]" onClick={openCreate}>
              + Yeni Çift
            </GoldButton>
          ) : null}
        </header>

        <div className="admin-tab-bar mb-6">
          <button
            type="button"
            className={cn("admin-tab-btn", mainTab === "couples" && "admin-tab-btn--active")}
            onClick={() => {
              setMainTab("couples");
              setView("list");
            }}
          >
            Çiftler
          </button>
          <button
            type="button"
            className={cn("admin-tab-btn", mainTab === "orders" && "admin-tab-btn--active")}
            onClick={() => setMainTab("orders")}
          >
            Siparişler
          </button>
          <button
            type="button"
            className={cn(
              "admin-tab-btn",
              mainTab === "aftermovie" && "admin-tab-btn--active",
            )}
            onClick={() => setMainTab("aftermovie")}
          >
            Düğün Filmi
          </button>
        </div>

        {(message || error) && (
          <p
            className={cn(
              "mb-4 text-sm",
              error ? "text-red-300/90" : "text-champagne/80"
            )}
          >
            {error ?? message}
          </p>
        )}

        {mainTab === "orders" ? (
          <SuperAdminOrdersTab />
        ) : mainTab === "aftermovie" ? (
          <SuperAdminAftermoviePanel />
        ) : view === "list" ? (
          <>
            <div className="super-admin-toolbar">
              <input
                className="memory-input memory-input-compact flex-1"
                placeholder="Çift adı veya slug ara…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="memory-input memory-input-compact w-auto"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              >
                <option value="all">Tümü</option>
                <option value="active">Aktif</option>
                <option value="passive">Pasif</option>
                <option value="archived">Arşiv</option>
              </select>
              <select
                className="memory-input memory-input-compact w-auto"
                value={sortByDate}
                onChange={(e) => setSortByDate(e.target.value as "desc" | "asc")}
              >
                <option value="desc">Tarih ↓</option>
                <option value="asc">Tarih ↑</option>
              </select>
            </div>

            {loading ? (
              <p className="py-12 text-center text-sm text-white/40">Yükleniyor…</p>
            ) : (
              <SuperAdminCoupleList
                couples={filteredCouples}
                onEdit={openEdit}
                onToggleStatus={handleToggleStatus}
                onDelete={openDeleteFlow}
                onRefresh={loadCouples}
              />
            )}
          </>
        ) : (
          <SuperAdminCoupleForm
            mode={view}
            initial={editingCouple}
            loading={formLoading}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setView("list");
              setEditingId(null);
              setEditingCouple(null);
            }}
          />
        )}

        <p className="super-admin-footer-note">
          Memoora kalıcı hatıra — otomatik silme yapılmaz. Kalıcı silme yalnızca çift onaylı super
          admin işlemidir.
        </p>
      </div>

      <AdminConfirmModal
        open={pendingDeleteId !== null}
        title={
          deleteStep === 1
            ? "Kalıcı silmek istiyor musunuz?"
            : "Slug doğrulaması gerekli"
        }
        description={
          deleteStep === 1
            ? "Bu işlem geri alınamaz. Önce pasife almayı veya arşivlemeyi tercih edin."
            : `Devam etmek için slug değerini yazın: ${pendingDeleteSlug ?? ""}`
        }
        confirmLabel={deleteStep === 1 ? "Evet, devam et" : "Kalıcı sil"}
        cancelLabel="Vazgeç"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!deleting) {
            setPendingDeleteId(null);
            setPendingDeleteSlug(null);
            setDeleteStep(1);
            setDeleteSlugConfirm("");
          }
        }}
      >
        {deleteStep === 2 ? (
          <input
            className="memory-input memory-input-compact mt-4 w-full"
            placeholder={pendingDeleteSlug ?? "slug"}
            value={deleteSlugConfirm}
            onChange={(e) => setDeleteSlugConfirm(e.target.value)}
          />
        ) : null}
      </AdminConfirmModal>
    </main>
  );
}
