/** Local static assets under /public — no external image URLs */
export const ASSETS = {
  treeHero: "/assets/tree-hero.png",
  landingCardMemories: "/assets/landing-card-memories.png",
  landingCardNote: "/assets/landing-card-note.png",
  memoryPlaceholder: "/assets/memory-placeholder.svg",
  /** Place mp4 at public/videos/living-tree-bg.mp4 */
  heroVideo: "/videos/living-tree-bg.mp4",
  /** Cinematic landing intro — public/videos/memoora-landing-intro.mp4 */
  landingIntroVideo: "/videos/memoora-landing-intro.mp4",
  /** Homepage hero — public/videos/memoora-hero.mp4 */
  memooraHeroVideo: "/videos/memoora-hero.mp4",
  /**
   * Post-intro sales hero — orman / yaprak / ürün kadrajı.
   * Çift ismi olmayan alternatif: landingHeroVideoAmbient
   */
  landingHeroVideo: "/videos/memoora-landing-intro.mp4",
  /** Sadece orman/ışık — telefon veya çift ismi yok */
  landingHeroVideoAmbient: "/videos/living-tree-bg.mp4",
  /** Anılarımız gallery templates in public/assets/ */
  galleryBg: "/assets/memories-bg.png",
  galleryFrame: "/assets/memories-frame.png",
  galleryFlourish: "/assets/gallery/memories-flourish.svg",
  /** Quiz Liderleri section — drop your image at public/assets/quiz-leaders-bg.png */
  quizLeadersBg: "/assets/quiz-leaders-bg.png",
  /** Product product renders */
  leafMagnet: "/assets/memoora-leaf-magnet.svg",
  leafKeychain: "/assets/memoora-leaf-keychain.svg",
} as const;
