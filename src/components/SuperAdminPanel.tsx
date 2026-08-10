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
import { SuperAdminHomepageMemoriesTab } from "./super-admin/SuperAdminHomepageMemoriesTab";
import type { Couple, CoupleCreateInput, CoupleListItem } from "@/lib/types";
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
type MainTab = "couples" | "orders" | "aftermovie" | "homepage";
type StatusFilter = "all" | "active" | "passive" | "archived";

export function SuperAdminPanel() {
  const [pin, setPin] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [couples, setCouples] = useState<CoupleListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<View>("list");
  const [mainTab, setMainTab] = useState<MainTab>("homepage");
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

  const adminSessionKey = getSuperAdminSessionKey();

  const loadCouples = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/couples", { credentials: "same-origin" });
      const json = (await res.json()) as {
        items?: CoupleListItem[];
        error?: string;
      };
      if (!res.ok) {
        setError(json.error ?? "Çiftler yüklenemedi.");
        return;
      }
      setCouples(json.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Çiftler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const restore = async () => {
      if (!isAdminSessionActive(adminSessionKey)) {
        if (!cancelled) {
          setAuthenticated(false);
          setAuthReady(true);
        }
        return;
      }
      try {
        const res = await fetch("/api/admin/session", {
          method: "GET",
          credentials: "same-origin",
        });
        if (!cancelled) {
          if (res.ok) {
            setAuthenticated(true);
          } else {
            setAuthenticated(false);
          }
          setAuthReady(true);
        }
      } catch {
        if (!cancelled) {
          setAuthenticated(false);
          setAuthReady(true);
        }
      }
    };
    void restore();
    return () => {
      cancelled = true;
    };
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
    if (!pin.trim()) {
      setPinError(true);
      return;
    }
    try {
      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
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
      const res = await fetch(`/api/admin/couples/${id}`, {
        credentials: "same-origin",
      });
      const json = (await res.json()) as { couple?: Couple; error?: string };
      if (!res.ok || !json.couple) {
        setError(json.error ?? "Çift bulunamadı.");
        return;
      }
      setEditingId(id);
      setEditingCouple(json.couple);
      setView("edit");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Çift yüklenemedi.");
    }
  };

  const handleFormSubmit = async (input: CoupleCreateInput) => {
    setFormLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res =
        view === "edit" && editingId
          ? await fetch(`/api/admin/couples/${editingId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              credentials: "same-origin",
              body: JSON.stringify(input),
            })
          : await fetch("/api/admin/couples", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "same-origin",
              body: JSON.stringify(input),
            });
      const json = (await res.json()) as {
        couple?: Couple;
        error?: string;
      };
      setFormLoading(false);

      if (!res.ok || !json.couple) {
        setError(json.error ?? "Kayıt başarısız.");
        return;
      }

      const resultCouple = json.couple;

      if (view === "edit") {
        const hasEmails =
          Boolean(input.brideEmail?.trim()) || Boolean(input.groomEmail?.trim());

        if (hasEmails) {
          const share = await shareCoupleDriveFolder(resultCouple.slug, {
            brideEmail: input.brideEmail,
            groomEmail: input.groomEmail,
          });
          setMessage(formatShareSaveMessage(share, true, "Çift", "güncellendi"));
        } else {
          setMessage("Çift güncellendi.");
        }
      } else {
        const drive = await provisionCoupleDriveFolder(resultCouple.slug);
        if (drive.ok) {
          setMessage(
            drive.created
              ? "Yeni çift oluşturuldu. Google Drive klasörü açıldı."
              : "Yeni çift oluşturuldu. Drive klasörü zaten mevcuttu.",
          );
        } else {
          setMessage(
            `Yeni çift oluşturuldu. Drive klasörü açılamadı: ${drive.error ?? "bilinmeyen hata"}`,
          );
        }
      }

      setView("list");
      setEditingId(null);
      setEditingCouple(null);
      await loadCouples();
    } catch (e) {
      setFormLoading(false);
      setError(e instanceof Error ? e.message : "Kayıt başarısız.");
    }
  };

  const handleToggleStatus = async (id: string, current: CoupleListItem["status"]) => {
    const next =
      current === "active"
        ? "passive"
        : current === "passive"
          ? "active"
          : "active";
    const res = await fetch(`/api/admin/couples/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ action: "status", status: next }),
    });
    const json = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(json.error ?? "Durum güncellenemedi.");
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
    const res = await fetch(`/api/admin/couples/${pendingDeleteId}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    const json = (await res.json()) as { error?: string };
    setDeleting(false);
    if (!res.ok) {
      setError(json.error ?? "Silme başarısız.");
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
        eyebrow="Memoora"
        title="Yönetim Merkezi"
        subtitle="Tüm düğünleri, PIN’leri ve siparişleri buradan yönetirsiniz."
        pin={pin}
        pinError={pinError}
        onPinChange={setPin}
        onSubmit={handlePinSubmit}
        mode="password"
      />
    );
  }

  return (
    <main className="super-admin-page">
      <div className="super-admin-inner">
        <header className="super-admin-header">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-champagne/70">
              Memoora
            </p>
            <h1 className="mt-1 font-serif text-2xl leading-snug tracking-wide text-white/95 sm:text-3xl">
              {mainTab === "orders"
                ? "Siparişler"
                : mainTab === "aftermovie"
                  ? "Düğün Filmleri"
                  : mainTab === "homepage"
                    ? "Görseller"
                    : "Düğünler"}
            </h1>
            {mainTab === "homepage" ? (
              <p className="mt-2 max-w-md text-sm leading-relaxed text-white/45">
                Anasayfa hatıralarını yükleyin, ölçekleyin ve yayınlayın.
              </p>
            ) : mainTab === "couples" && view === "list" ? (
              <p className="mt-2 text-sm leading-relaxed text-white/40">
                {filteredCouples.length} düğün — PIN, link ve durum tek yerde
              </p>
            ) : null}
          </div>
          {mainTab === "couples" && view === "list" ? (
            <GoldButton type="button" variant="primary" className="!text-[10px]" onClick={openCreate}>
              + Yeni Düğün
            </GoldButton>
          ) : null}
        </header>

        <nav className="super-admin-nav" aria-label="Yönetim sekmeleri">
          {(
            [
              ["homepage", "Görseller"],
              ["couples", "Düğünler"],
              ["orders", "Siparişler"],
              ["aftermovie", "Film"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={cn(
                "super-admin-nav__btn",
                mainTab === id && "super-admin-nav__btn--active",
              )}
              onClick={() => {
                setMainTab(id);
                if (id === "couples") setView("list");
              }}
            >
              {label}
            </button>
          ))}
        </nav>

        {(message || error) && (
          <p
            className={cn(
              "mb-4 text-sm",
              error ? "text-red-300/90" : "text-champagne/80",
            )}
          >
            {error ?? message}
          </p>
        )}

        {mainTab === "orders" ? (
          <SuperAdminOrdersTab />
        ) : mainTab === "aftermovie" ? (
          <SuperAdminAftermoviePanel />
        ) : mainTab === "homepage" ? (
          <SuperAdminHomepageMemoriesTab />
        ) : view === "list" ? (
          <>
            <div className="super-admin-toolbar">
              <input
                className="memory-input memory-input-compact flex-1"
                placeholder="İsim veya slug ara…"
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
                <option value="desc">Yeni → Eski</option>
                <option value="asc">Eski → Yeni</option>
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
          Her düğünün admin PIN’i kartta görünür. Kalıcı silme geri alınamaz.
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
            ? "Bu işlem geri alınamaz. Önce pasife almayı tercih edin."
            : `Devam etmek için slug yazın: ${pendingDeleteSlug ?? ""}`
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
