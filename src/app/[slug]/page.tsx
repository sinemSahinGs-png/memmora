import { notFound } from "next/navigation";
import { CoupleMemoryWorld } from "@/components/CoupleMemoryWorld";
import { CoupleStatusNotice } from "@/components/CoupleStatusNotice";
import { resolveCoupleForPage } from "@/lib/supabase/couples";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const couple = await resolveCoupleForPage(slug);
  if (!couple) return { title: "Bulunamadı" };
  return {
    title: `${couple.names} — Memoora`,
    description: couple.tagline,
  };
}

export default async function CouplePage({ params }: PageProps) {
  const { slug } = await params;
  const couple = await resolveCoupleForPage(slug);

  if (!couple) {
    notFound();
  }

  if (couple.deletedAt) {
    return (
      <CoupleStatusNotice displayTitle={couple.displayTitle} variant="deleted" />
    );
  }

  if (couple.status === "archived") {
    return (
      <CoupleStatusNotice displayTitle={couple.displayTitle} variant="archived" />
    );
  }

  return (
    <CoupleMemoryWorld
      couple={couple}
      initialLeafCount={couple.leafCount}
      acceptsMemories={couple.status === "active"}
    />
  );
}
