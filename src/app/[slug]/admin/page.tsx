import { notFound } from "next/navigation";
import { AdminPanel } from "@/components/AdminPanel";
import { resolveCoupleAdminForPage } from "@/lib/supabase/couples";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  return { title: `Admin — ${slug} — Memoora`, robots: "noindex" };
}

export default async function AdminPage({ params }: PageProps) {
  const { slug } = await params;
  const couple = await resolveCoupleAdminForPage(slug);

  if (!couple) {
    notFound();
  }

  return (
    <AdminPanel
      couple={couple}
      coupleAdminPin={couple.adminPin ?? null}
    />
  );
}
