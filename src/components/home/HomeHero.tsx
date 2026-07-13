import Link from "next/link";
import { getDemoHref, HOME_HERO, type HomeDemoCouple } from "@/lib/home-content";
import { HomeHeroVisual } from "./HomeHeroVisual";
import { PlayIcon } from "./home-icons";

interface HomeHeroProps {
  demos: HomeDemoCouple[];
}

export function HomeHero({ demos }: HomeHeroProps) {
  const demoHref = getDemoHref(demos);

  return (
    <section className="mh-hero" aria-labelledby="home-hero-heading">
      <HomeHeroVisual />

      <div className="mh-hero__content">
        <h1 id="home-hero-heading" className="mh-hero__headline">
          Düğün
          <br />
          anılarını
          <br />
          <span className="mh-gold-text">yaşat.</span>
        </h1>
        <p className="mh-hero__body">{HOME_HERO.body}</p>
        <div className="mh-hero__actions">
          <Link href={demoHref} className="mh-btn mh-hero__primary">
            {HOME_HERO.primaryCta}
          </Link>
          <Link href="#how-it-works" className="mh-hero__secondary">
            <span className="mh-play-icon">
              <PlayIcon />
            </span>
            {HOME_HERO.secondaryCta}
          </Link>
        </div>
      </div>
    </section>
  );
}
