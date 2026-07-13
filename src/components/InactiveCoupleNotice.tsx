import Link from "next/link";

interface InactiveCoupleNoticeProps {
  displayTitle: string;
}

export function InactiveCoupleNotice({ displayTitle }: InactiveCoupleNoticeProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#1a2822] px-6 text-center">
      <p className="text-[10px] uppercase tracking-[0.3em] text-[#9AA89B]">Memoora</p>
      <h1 className="mt-4 font-serif text-3xl text-[#F4F1E8]">{displayTitle}</h1>
      <p className="mt-4 max-w-sm text-base leading-relaxed text-[#F4F1E8]/55">
        Bu anı dünyası şu an aktif değil.
      </p>
      <Link
        href="/"
        className="premium-btn-secondary mt-8"
      >
        Memoora Ana Sayfa
      </Link>
    </main>
  );
}
