import { notFound } from "next/navigation";
import { PremiumInviteExperience } from "@/components/invite/PremiumInviteExperience";
import { MobileAppShell } from "@/components/MobileAppShell";
import { resolveCoupleForPage } from "@/lib/supabase/couples";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const couple = await resolveCoupleForPage(slug);
  if (!couple) return { title: "Bulunamadı" };
  const title =
    couple.invitationTitle.trim() || couple.displayTitle || couple.names;
  return {
    title: `${title} — E-Davetiye · Memoora`,
    description: couple.invitationMessage,
  };
}

export default async function InvitePage({ params }: PageProps) {
  const { slug } = await params;
  const couple = await resolveCoupleForPage(slug);

  if (!couple || !couple.invitationEnabled) {
    notFound();
  }

  if (couple.status === "archived") {
    notFound();
  }

  return (
    <MobileAppShell fullWidth className="invite-route-shell">
      <PremiumInviteExperience couple={couple} />
    </MobileAppShell>
  );
}
