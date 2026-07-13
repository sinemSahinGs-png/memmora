import { ScrollScrubHero } from "@/components/ScrollScrubHero";
import { HomeNavbar } from "@/components/home/HomeNavbar";
import { PremiumHomeFooter } from "@/components/home/PremiumHomeFooter";
import { ExperienceFeaturesSection } from "@/components/home/sections/ExperienceFeaturesSection";
import { HomeCtaSection } from "@/components/home/sections/HomeCtaSection";
import { HowItWorksSection } from "@/components/home/sections/HowItWorksSection";
import { LivingMemoryTreeSection } from "@/components/home/sections/LivingMemoryTreeSection";
import { MemoryOrbsSection } from "@/components/home/sections/MemoryOrbsSection";
import { NfcExperienceSection } from "@/components/home/sections/NfcExperienceSection";
import { StoryManifestoSection } from "@/components/home/sections/StoryManifestoSection";
import { getDemoHref, type HomeDemoCouple } from "@/lib/home-content";
import "@/app/home-premium.css";

interface MemooraHomePageProps {
  demos: HomeDemoCouple[];
}

export function MemooraHomePage({ demos }: MemooraHomePageProps) {
  const demoHref = getDemoHref(demos);

  return (
    <div className="memoora-home-premium">
      <HomeNavbar demoHref={demoHref} />
      <main>
        <ScrollScrubHero />
        <StoryManifestoSection />
        <HowItWorksSection />
        <LivingMemoryTreeSection />
        <NfcExperienceSection />
        <MemoryOrbsSection />
        <ExperienceFeaturesSection />
        <HomeCtaSection demoHref={demoHref} />
      </main>
      <PremiumHomeFooter />
    </div>
  );
}
