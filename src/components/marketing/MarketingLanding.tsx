import { MemooraLandingPage } from "@/components/marketing/MemooraLandingPage";

interface DemoCouple {
  slug: string;
  title: string;
}

interface MarketingLandingProps {
  demos: DemoCouple[];
}

export function MarketingLanding({ demos }: MarketingLandingProps) {
  return <MemooraLandingPage demos={demos} />;
}
