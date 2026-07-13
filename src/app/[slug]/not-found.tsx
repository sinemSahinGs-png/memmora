import Link from "next/link";
import { GoldButton } from "@/components/GoldButton";
import { MobileAppShell } from "@/components/MobileAppShell";

export default function NotFound() {
  return (
    <MobileAppShell>
      <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <p className="mb-6 text-[10px] uppercase tracking-[0.35em] text-champagne/50">
          Bu ağaç henüz büyüyor
        </p>
        <h1 className="font-serif text-3xl text-white/90">Anı dünyası bulunamadı</h1>
        <p className="mt-4 max-w-xs text-sm text-white/45">
          Aradığın ağaç henüz bu ormanda yok.
        </p>
        <div className="mt-10">
          <GoldButton href="/" variant="primary">
            Ana sayfaya dön
          </GoldButton>
        </div>
      </main>
    </MobileAppShell>
  );
}
