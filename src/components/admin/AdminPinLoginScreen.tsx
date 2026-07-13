"use client";

import { useEffect, useId, useState } from "react";
import { GlassCard } from "../GlassCard";
import { GoldButton } from "../GoldButton";
import { MemoryGardenBackground } from "../memory-mirror/MemoryGardenBackground";

interface AdminPinLoginScreenProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  pin: string;
  pinError: boolean;
  onPinChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AdminPinLoginScreen({
  eyebrow,
  title,
  subtitle,
  pin,
  pinError,
  onPinChange,
  onSubmit,
}: AdminPinLoginScreenProps) {
  const inputId = useId();
  const [showPin, setShowPin] = useState(false);
  const [inputReady, setInputReady] = useState(false);

  useEffect(() => {
    setInputReady(true);
  }, []);

  const enableInput = () => {
    setInputReady(true);
  };

  return (
    <main className="admin-pin-screen">
      <MemoryGardenBackground className="admin-pin-screen__bg" />
      <div className="admin-pin-screen__shade" aria-hidden />
      <div className="admin-pin-screen__glow" aria-hidden />

      <GlassCard strong className="admin-pin-screen__card">
        <div className="admin-pin-screen__copy">
          <p className="admin-pin-screen__eyebrow">{eyebrow}</p>
          <h1 className="admin-pin-screen__title">{title}</h1>
          <p className="admin-pin-screen__subtitle">{subtitle}</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="admin-pin-screen__form"
          autoComplete="off"
        >
          <div className="admin-pin-screen__field">
            <label htmlFor={inputId} className="admin-pin-screen__label">
              PIN
            </label>
            <div className="admin-pin-screen__input-wrap">
              <input
                id={inputId}
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                value={pin}
                onChange={(e) => onPinChange(e.target.value)}
                placeholder="PIN girin"
                aria-label="PIN"
                className="memory-input memory-input-compact admin-pin-screen__input text-center tracking-[0.45em]"
                autoComplete="one-time-code"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                readOnly={!inputReady}
                onFocus={enableInput}
                onClick={enableInput}
                data-lpignore="true"
                data-1p-ignore="true"
                name="memoora-admin-pin"
              />
              <button
                type="button"
                className="admin-pin-screen__toggle"
                onClick={() => setShowPin((value) => !value)}
                aria-label={showPin ? "PIN'i gizle" : "PIN'i göster"}
                aria-pressed={showPin}
              >
                {showPin ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
          </div>
          {pinError ? (
            <p className="admin-pin-screen__error" role="alert">
              Yanlış PIN — tekrar deneyin
            </p>
          ) : null}
          <GoldButton
            type="submit"
            variant="primary"
            className="admin-pin-screen__submit w-full"
          >
            Giriş
          </GoldButton>
        </form>
      </GlassCard>
    </main>
  );
}

function IconEye() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2.036 12.322a1 1 0 0 1 0-.644C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconEyeOff() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
