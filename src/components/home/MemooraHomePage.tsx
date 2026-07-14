import { ScrollScrubHero } from "@/components/ScrollScrubHero";
import { PostHeroAmbientBackground } from "@/components/PostHeroAmbientBackground";
import { HomeNavbar } from "@/components/home/HomeNavbar";
import { PremiumHomeFooter } from "@/components/home/PremiumHomeFooter";
import { CompleteExperienceSection } from "@/components/home/sections/CompleteExperienceSection";
import { DigitalInvitationSection } from "@/components/home/sections/DigitalInvitationSection";
import { HomeCtaSection } from "@/components/home/sections/HomeCtaSection";
import { InteractiveQuizSection } from "@/components/home/sections/InteractiveQuizSection";
import { ParticipantManagementSection } from "@/components/home/sections/ParticipantManagementSection";
import { LivingMemoryTreeSection } from "@/components/home/sections/LivingMemoryTreeSection";
import { PersonalizedProductsSection } from "@/components/home/sections/PersonalizedProductsSection";
import { StoryManifestoSection } from "@/components/home/sections/StoryManifestoSection";
import { SharedMemoriesArchiveSection } from "@/components/home/SharedMemoriesArchiveSection";
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
        <ScrollScrubHero demoHref={demoHref} />

        <div className="post-hero-world">
          <PostHeroAmbientBackground />

          <div className="post-hero-content">
            <StoryManifestoSection />
            <SharedMemoriesArchiveSection demoHref={demoHref} />
            <DigitalInvitationSection />
            <ParticipantManagementSection />
            <InteractiveQuizSection />
            <PersonalizedProductsSection />
            <LivingMemoryTreeSection />
            <CompleteExperienceSection />
            <HomeCtaSection demoHref={demoHref} />
            <PremiumHomeFooter />
          </div>
        </div>
      </main>
    </div>
  );
}
