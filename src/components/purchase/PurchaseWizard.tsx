"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { PurchaseLivePreview } from "@/components/purchase/PurchaseLivePreview";
import { WeddingDatePicker } from "@/components/purchase/WeddingDatePicker";
import {
  PURCHASE_PRODUCTS,
  WEDDING_DATE_TOO_SOON_MESSAGE,
  calculatePurchaseTotals,
  formatTry,
  getMinimumWeddingDate,
  isWeddingDateValid,
  type PurchaseProductType,
} from "@/lib/memoora-purchase/pricing";
import { PRODUCT_ASSETS } from "@/lib/memoora-purchase/products";
import type { MemooraOrderRecord } from "@/lib/memoora-purchase/types";
import type { PaymentIntentResult } from "@/lib/payments/types";
import { PaytrIframe } from "@/components/purchase/PaytrIframe";

type StepId = "couple" | "products" | "preview" | "payment" | "confirmation";

const STEPS: { id: StepId; label: string }[] = [
  { id: "couple", label: "Çift" },
  { id: "products", label: "Ürünler" },
  { id: "preview", label: "Önizleme" },
  { id: "payment", label: "Ödeme" },
  { id: "confirmation", label: "Onay" },
];

const stepVariants = {
  enter: { opacity: 0, x: 28 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -22 },
};

export function PurchaseWizard() {
  const [step, setStep] = useState<StepId>("couple");
  const [magnetQty, setMagnetQty] = useState(50);
  const [keychainQty, setKeychainQty] = useState(0);
  const [brideName, setBrideName] = useState("");
  const [groomName, setGroomName] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<MemooraOrderRecord | null>(null);
  const [payment, setPayment] = useState<PaymentIntentResult | null>(null);
  const [iframeToken, setIframeToken] = useState<string | null>(null);

  const minDate = useMemo(() => getMinimumWeddingDate(), []);
  const totals = useMemo(
    () =>
      calculatePurchaseTotals([
        { productType: "magnet", quantity: magnetQty },
        { productType: "keychain", quantity: keychainQty },
      ]),
    [magnetQty, keychainQty],
  );

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  const bumpQty = (type: PurchaseProductType, delta: number) => {
    setError(null);
    if (type === "magnet") {
      setMagnetQty((q) => Math.max(0, Math.min(500, q + delta)));
    } else {
      setKeychainQty((q) => Math.max(0, Math.min(500, q + delta)));
    }
  };

  const goNext = () => {
    setError(null);
    if (step === "couple") {
      if (!brideName.trim()) {
        setError("Gelin adı gerekli.");
        return;
      }
      if (!groomName.trim()) {
        setError("Damat adı gerekli.");
        return;
      }
      if (!weddingDate) {
        setError("Düğün tarihi gerekli.");
        return;
      }
      if (!isWeddingDateValid(weddingDate)) {
        setError(WEDDING_DATE_TOO_SOON_MESSAGE);
        return;
      }
      setStep("products");
      return;
    }
    if (step === "products") {
      if (totals.lines.length === 0) {
        setError("En az bir ürün için adet seçin.");
        return;
      }
      setStep("preview");
      return;
    }
    if (step === "preview") {
      setStep("payment");
    }
  };

  const goBack = () => {
    setError(null);
    if (step === "products") setStep("couple");
    else if (step === "preview") setStep("products");
    else if (step === "payment") setStep("preview");
  };

  const submitOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const email = customerEmail.trim();
      const phone = customerPhone.trim();
      if (!email) {
        throw new Error("Ödeme için e-posta gerekli.");
      }
      if (!phone) {
        throw new Error("Ödeme için telefon gerekli.");
      }

      const response = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brideName: brideName.trim(),
          groomName: groomName.trim(),
          weddingDate,
          customerEmail: email,
          customerPhone: phone,
          items: [
            { productType: "magnet", quantity: magnetQty },
            { productType: "keychain", quantity: keychainQty },
          ],
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "Sipariş oluşturulamadı.");
      }

      const created = data.order as MemooraOrderRecord;
      setOrder(created);
      setPayment(data.payment as PaymentIntentResult);

      const tokenRes = await fetch("/api/paytr/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: created.id }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || !tokenData.success || !tokenData.iframeToken) {
        throw new Error(
          tokenData.error ?? "PayTR ödeme formu başlatılamadı.",
        );
      }

      setIframeToken(String(tokenData.iframeToken));
      setStep("confirmation");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Beklenmeyen hata.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="purchase-flow">
      <header className="purchase-flow__header">
        <Link href="/" className="purchase-flow__logo">
          MEMOORA
        </Link>
        <p className="purchase-flow__tag">Satın alma</p>
      </header>

      <nav className="purchase-flow__steps" aria-label="Sipariş adımları">
        {STEPS.map((s, i) => {
          const done = i < stepIndex;
          const active = s.id === step;
          return (
            <div
              key={s.id}
              className={`purchase-flow__step${active ? " is-active" : ""}${done ? " is-done" : ""}`}
            >
              <span className="purchase-flow__step-index">{i + 1}</span>
              <span className="purchase-flow__step-label">{s.label}</span>
            </div>
          );
        })}
      </nav>

      <div className="purchase-flow__layout">
        <div className="purchase-flow__main">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="purchase-flow__panel"
            >
              {step === "couple" && (
                <>
                  <h1>Çift bilgileri</h1>
                  <p className="purchase-flow__lead">
                    Önce isimleri ve düğün tarihini girin — ürün seçimi ve canlı
                    önizleme buna göre kişiselleşir.
                  </p>
                  <div className="purchase-form">
                    <label>
                      <span>Gelin adı</span>
                      <input
                        value={brideName}
                        onChange={(e) => setBrideName(e.target.value)}
                        placeholder="Örn. Elif"
                        autoComplete="given-name"
                      />
                    </label>
                    <label>
                      <span>Damat adı</span>
                      <input
                        value={groomName}
                        onChange={(e) => setGroomName(e.target.value)}
                        placeholder="Örn. Mehmet"
                        autoComplete="family-name"
                      />
                    </label>
                    <div className="purchase-form__date">
                      <span>Düğün tarihi</span>
                      <WeddingDatePicker
                        value={weddingDate}
                        minDate={minDate}
                        onChange={(iso) => {
                          setWeddingDate(iso);
                          setError(null);
                        }}
                      />
                    </div>
                    <p className="purchase-form__hint">
                      Düğün tarihi bugünden en az 4 gün sonrası olmalıdır.
                    </p>
                  </div>
                </>
              )}

              {step === "products" && (
                <>
                  <h1>Ürünlerinizi seçin</h1>
                  <p className="purchase-flow__lead">
                    {brideName} & {groomName} için magnet ve anahtarlığı aynı
                    siparişte birleştirebilirsiniz. Fiyatlar KDV hariç birim
                    fiyattır.
                  </p>

                  <div className="purchase-products">
                    {(
                      [
                        ["magnet", magnetQty],
                        ["keychain", keychainQty],
                      ] as const
                    ).map(([type, qty]) => {
                      const meta = PURCHASE_PRODUCTS[type];
                      const visual = PRODUCT_ASSETS[type];
                      const selected = qty > 0;
                      const setQty = (next: number) => {
                        const clamped = Math.max(0, Math.min(500, next));
                        if (type === "magnet") setMagnetQty(clamped);
                        else setKeychainQty(clamped);
                        setError(null);
                      };
                      return (
                        <article
                          key={type}
                          className={`purchase-product${selected ? " is-selected" : ""}${type === "magnet" ? " purchase-product--featured" : ""}`}
                        >
                          <div className="purchase-product__visual">
                            <div className="purchase-product__orbit">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={`${visual.src}?v=3`}
                                alt={visual.alt}
                                width={visual.width}
                                height={visual.height}
                                className="purchase-product__img"
                                decoding="async"
                              />
                            </div>
                          </div>
                          <div className="purchase-product__body">
                            <h2>{meta.name}</h2>
                            <p>{meta.description}</p>
                            <p className="purchase-product__price">
                              {formatTry(meta.unitPrice)}{" "}
                              <span>+ KDV / adet</span>
                            </p>
                            <div className="purchase-qty-row">
                              <div className="purchase-qty">
                                <button
                                  type="button"
                                  aria-label="Azalt"
                                  onClick={() => bumpQty(type, -1)}
                                >
                                  −
                                </button>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  value={qty === 0 ? "" : String(qty)}
                                  placeholder="0"
                                  onChange={(e) => {
                                    const digits = e.target.value.replace(
                                      /\D/g,
                                      "",
                                    );
                                    if (digits === "") {
                                      setQty(0);
                                      return;
                                    }
                                    setQty(Number(digits));
                                  }}
                                  onBlur={() => {
                                    if (!Number.isFinite(qty)) setQty(0);
                                  }}
                                />
                                <button
                                  type="button"
                                  aria-label="Artır"
                                  onClick={() => bumpQty(type, 1)}
                                >
                                  +
                                </button>
                              </div>
                              <button
                                type="button"
                                className="purchase-qty-reset"
                                aria-label={`${meta.name} adedini sıfırla`}
                                title="Sıfırla"
                                disabled={qty === 0}
                                onClick={() => setQty(0)}
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  aria-hidden
                                >
                                  <path
                                    d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M7 7l1 13h8l1-13"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                <span>Sıfırla</span>
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </>
              )}

              {step === "preview" && (
                <>
                  <h1>Canlı önizleme</h1>
                  <p className="purchase-flow__lead">
                    {brideName} & {groomName} için gerçek Memoora düğün sayfası
                    ve e-davetiye demosunu inceleyin.
                  </p>
                  <PurchaseLivePreview
                    brideName={brideName}
                    groomName={groomName}
                    weddingDate={weddingDate}
                  />
                </>
              )}

              {step === "payment" && (
                <>
                  <h1>Ödeme</h1>
                  <p className="purchase-flow__lead">
                    Bilgileri kontrol edin. Onayladığınızda güvenli PayTR ödeme
                    formu açılır.
                  </p>
                  <div className="purchase-review">
                    <p>
                      <strong>
                        {brideName} & {groomName}
                      </strong>
                    </p>
                    <p>Düğün: {weddingDate}</p>
                    <ul>
                      {totals.lines.map((line) => (
                        <li key={line.productType}>
                          {line.name} × {line.quantity} —{" "}
                          {formatTry(line.lineTotal)}
                        </li>
                      ))}
                    </ul>
                    <p className="purchase-review__total">
                      Toplam (KDV dahil): {formatTry(totals.total)}
                    </p>
                  </div>
                  <div className="purchase-form purchase-form--payment">
                    <label>
                      <span>E-posta</span>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="ornek@eposta.com"
                        autoComplete="email"
                        required
                      />
                    </label>
                    <label>
                      <span>Telefon</span>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="05xx xxx xx xx"
                        autoComplete="tel"
                        required
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    className="purchase-btn purchase-btn--primary"
                    disabled={loading}
                    onClick={submitOrder}
                  >
                    {loading ? "Ödeme hazırlanıyor…" : "Güvenli ödemeye geç"}
                  </button>
                </>
              )}

              {step === "confirmation" && order && (
                <>
                  <h1>Güvenli ödeme</h1>
                  <p className="purchase-flow__lead">
                    {order.brideName} & {order.groomName} siparişi oluşturuldu.
                    Kart bilgilerinizi aşağıdaki PayTR formuna girin.
                  </p>
                  <div className="purchase-confirm">
                    <p>
                      Sipariş no: <strong>{order.id}</strong>
                    </p>
                    <p>Toplam: {formatTry(order.total)}</p>
                    {iframeToken ? (
                      <PaytrIframe token={iframeToken} />
                    ) : (
                      <>
                        <p>Ödeme durumu: {order.paymentStatus}</p>
                        {payment?.status === "requires_configuration" && (
                          <div className="purchase-payment-note">
                            <h2>POS bilgileri gerekli</h2>
                            <p>{payment.message}</p>
                            {payment.checklist && (
                              <ul>
                                {payment.checklist.map((item) => (
                                  <li key={item}>{item}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </>
                    )}
                    <Link href="/" className="purchase-btn purchase-btn--ghost">
                      Ana sayfaya dön
                    </Link>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {error && <p className="purchase-flow__error">{error}</p>}

          {step !== "confirmation" && step !== "payment" && (
            <div className="purchase-flow__nav">
              {step !== "couple" ? (
                <button
                  type="button"
                  className="purchase-btn purchase-btn--ghost"
                  onClick={goBack}
                >
                  Geri
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                className="purchase-btn purchase-btn--primary"
                onClick={goNext}
              >
                Devam
              </button>
            </div>
          )}

          {step === "payment" && (
            <div className="purchase-flow__nav">
              <button
                type="button"
                className="purchase-btn purchase-btn--ghost"
                onClick={goBack}
                disabled={loading}
              >
                Geri
              </button>
            </div>
          )}
        </div>

        <aside className="purchase-summary" aria-live="polite">
          <p className="purchase-summary__eyebrow">Sipariş özeti</p>
          <h2>
            {brideName || groomName
              ? `${brideName || "Gelin"} & ${groomName || "Damat"}`
              : "Memoora siparişi"}
          </h2>
          {weddingDate ? (
            <p className="purchase-summary__date">{weddingDate}</p>
          ) : null}
          <ul className="purchase-summary__lines">
            {totals.lines.length === 0 && (
              <li className="is-empty">Henüz ürün seçilmedi</li>
            )}
            {totals.lines.map((line) => (
              <li key={line.productType}>
                <span>
                  {line.name} × {line.quantity}
                </span>
                <span>{formatTry(line.lineSubtotal)}</span>
              </li>
            ))}
          </ul>
          <dl className="purchase-summary__totals">
            <div>
              <dt>Ara toplam</dt>
              <dd>{formatTry(totals.subtotal)}</dd>
            </div>
            <div>
              <dt>KDV (%{Math.round(totals.vatRate * 100)})</dt>
              <dd>{formatTry(totals.vat)}</dd>
            </div>
            <div className="is-total">
              <dt>Toplam</dt>
              <dd>{formatTry(totals.total)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
