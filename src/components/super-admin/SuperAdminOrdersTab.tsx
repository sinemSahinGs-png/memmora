"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { OrderRecord, OrderStatus, PaymentStatus } from "@/lib/types";
import { buildCoupleAdminUrl, buildCouplePublicUrl } from "@/lib/site-url";
import { cn } from "@/lib/utils";

type PaymentFilter = "all" | PaymentStatus;
type StatusFilter = "all" | OrderStatus;

export function SuperAdminOrdersTab() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/orders");
      const json = (await res.json()) as { orders?: OrderRecord[]; error?: string };
      if (!res.ok) throw new Error(json.error ?? "Yüklenemedi.");
      setOrders(json.orders ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (paymentFilter !== "all" && o.paymentStatus !== paymentFilter) return false;
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (!q) return true;
      return (
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        (o.coupleSlug ?? "").toLowerCase().includes(q)
      );
    });
  }, [orders, paymentFilter, statusFilter, search]);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      alert("Güncellenemedi.");
      return;
    }
    await loadOrders();
  };

  return (
    <div className="super-admin-orders">
      <div className="super-admin-toolbar">
        <input
          className="memory-input memory-input-compact flex-1"
          placeholder="Müşteri, e-posta veya slug…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="memory-input memory-input-compact w-auto"
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value as PaymentFilter)}
        >
          <option value="all">Tüm ödemeler</option>
          <option value="manual_pending">Manual Pending</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
        </select>
        <select
          className="memory-input memory-input-compact w-auto"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
        >
          <option value="all">Tüm durumlar</option>
          <option value="active">Aktif</option>
          <option value="passive">Pasif</option>
          <option value="archived">Arşiv</option>
        </select>
      </div>

      {error ? <p className="mb-4 text-sm text-red-300/90">{error}</p> : null}

      {loading ? (
        <p className="py-12 text-center text-sm text-white/40">Yükleniyor…</p>
      ) : filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-white/40">Sipariş bulunamadı.</p>
      ) : (
        <div className="super-admin-orders-list">
          {filtered.map((order) => {
            const slug = order.coupleSlug ?? "";
            const publicUrl = slug ? buildCouplePublicUrl(slug) : null;
            const adminUrl = slug ? buildCoupleAdminUrl(slug) : null;

            return (
              <article key={order.id} className="super-admin-order-card glass-panel-strong">
                <div className="super-admin-order-card__head">
                  <div>
                    <p className="font-serif text-xl text-white/92">{order.customerName}</p>
                    <p className="text-sm text-white/45">{order.customerEmail}</p>
                    {order.customerPhone ? (
                      <p className="text-xs text-white/35">{order.customerPhone}</p>
                    ) : null}
                  </div>
                  <div className="text-right">
                    <span className="super-admin-order-badge">{order.packageType ?? "—"}</span>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-white/35">
                      {order.paymentStatus}
                    </p>
                  </div>
                </div>

                <div className="super-admin-order-card__meta">
                  <span className={cn("admin-status-badge", order.status === "active" && "admin-status-badge--active")}>
                    {order.status}
                  </span>
                  <span className="text-xs text-white/35">
                    {new Date(order.createdAt).toLocaleString("tr-TR")}
                  </span>
                </div>

                <div className="super-admin-order-card__links">
                  {publicUrl ? (
                    <Link href={publicUrl} target="_blank" rel="noopener noreferrer">
                      Çift sayfası
                    </Link>
                  ) : null}
                  {adminUrl ? (
                    <Link href={adminUrl} target="_blank" rel="noopener noreferrer">
                      Admin
                    </Link>
                  ) : null}
                  {order.driveFolderUrl ? (
                    <a href={order.driveFolderUrl} target="_blank" rel="noopener noreferrer">
                      Drive
                    </a>
                  ) : null}
                </div>

                <div className="super-admin-order-card__actions">
                  {order.status !== "passive" ? (
                    <button type="button" onClick={() => updateStatus(order.id, "passive")}>
                      Pasife al
                    </button>
                  ) : (
                    <button type="button" onClick={() => updateStatus(order.id, "active")}>
                      Aktifleştir
                    </button>
                  )}
                  {order.status !== "archived" ? (
                    <button type="button" onClick={() => updateStatus(order.id, "archived")}>
                      Arşivle
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
