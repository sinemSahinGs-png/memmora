import Link from "next/link";

type NoticeVariant = "passive" | "archived" | "deleted";

interface CoupleStatusNoticeProps {
  displayTitle: string;
  variant: NoticeVariant;
}

const COPY: Record<
  NoticeVariant,
  { title: string; body: string }
> = {
  passive: {
    title: "Anı kabul edilmiyor",
    body: "Bu Memoora sayfası şu anda anı kabul etmiyor. Daha önce bırakılan anılar görüntülenebilir.",
  },
  archived: {
    title: "Arşivlenmiş",
    body: "Bu düğün arşivlenmiştir. Public erişim kapalı olabilir.",
  },
  deleted: {
    title: "Sayfa bulunamadı",
    body: "Bu Memoora sayfası artık public olarak görüntülenemiyor.",
  },
};

export function CoupleStatusNotice({
  displayTitle,
  variant,
}: CoupleStatusNoticeProps) {
  const copy = COPY[variant];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#1a2822] px-6 text-center">
      <p className="text-[10px] uppercase tracking-[0.3em] text-[#9AA89B]">Memoora</p>
      <h1 className="mt-4 font-serif text-3xl text-[#F4F1E8]">{displayTitle}</h1>
      <p className="mt-2 text-sm uppercase tracking-[0.2em] text-champagne/70">
        {copy.title}
      </p>
      <p className="mt-4 max-w-md text-base leading-relaxed text-[#F4F1E8]/55">
        {copy.body}
      </p>
      <Link href="/" className="premium-btn-secondary mt-8">
        Memoora Ana Sayfa
      </Link>
    </main>
  );
}
