export type SharedMemory = {
  id: string;
  src: string;
  guestName: string;
  category: string;
  title: string;
  caption?: string;
  time?: string;
  objectPosition?: string;
  frameZoom?: number;
  framePanX?: number;
  framePanY?: number;
};

/**
 * Only these 7 real photos are used as static fallback.
 * The ring still looks dense by repeating them across many cards.
 */
export const SHARED_MEMORY_SOURCES = [
  "/images/memoora/shared-memories/01.png",
  "/images/memoora/shared-memories/02.png",
  "/images/memoora/shared-memories/03.png",
  "/images/memoora/shared-memories/04.png",
  "/images/memoora/shared-memories/05.png",
  "/images/memoora/shared-memories/06.png",
  "/images/memoora/shared-memories/07.png",
] as const;

const PROJECTS = [
  {
    guestName: "Ece",
    category: "İlk Dans",
    title: "Dans pistinde",
    caption: "Dans pistine ilk çıktıkları an.",
    time: "22:41",
  },
  {
    guestName: "Kerem",
    category: "Arkadaşlar",
    title: "Kalabalığın ortası",
    caption: "Gecenin en kalabalık karesi.",
    time: "23:18",
  },
  {
    guestName: "Zeynep",
    category: "Hazırlık",
    title: "Tören öncesi",
    caption: "Törenden hemen önce.",
    time: "17:06",
  },
  {
    guestName: "Burak",
    category: "Nikâh",
    title: "Evet demeden önce",
    caption: "Evet demeden bir saniye önce.",
    time: "19:12",
  },
  {
    guestName: "Selin",
    category: "Aile",
    title: "Gözler dolarken",
    caption: "Annelerin gözleri dolarken.",
    time: "19:48",
  },
  {
    guestName: "Can",
    category: "Pasta",
    title: "İlk dilim",
    caption: "İlk dilimi birlikte keserken.",
    time: "21:05",
  },
  {
    guestName: "Elif",
    category: "İlk Bakış",
    title: "İlk bakış",
    caption: "Birbirlerini ilk gördükleri an.",
    time: "18:33",
  },
  {
    guestName: "Mert",
    category: "Eğlence",
    title: "Müzik yükselirken",
    caption: "Müzik yükselmeye başladığında.",
    time: "00:12",
  },
  {
    guestName: "Ayşe",
    category: "Gece Sonu",
    title: "Son gülümseme",
    caption: "Vedalaşmadan önceki son gülümseme.",
    time: "01:40",
  },
  {
    guestName: "Deniz",
    category: "Arkadaşlar",
    title: "Masadaki kahkaha",
    caption: "Masadaki kahkahalar.",
    time: "20:27",
  },
] as const;

/** Dense ring card count — visuals still come from the source pool */
export const ITEM_COUNT = 136;

function shuffleSeeded<T>(arr: T[], seed = 136): T[] {
  const a = [...arr];
  let s = seed >>> 0;
  const next = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
  for (let k = a.length - 1; k > 0; k--) {
    const j = Math.floor(next() * (k + 1));
    [a[k], a[j]] = [a[j], a[k]];
  }
  return a;
}

export type SharedMemorySource = {
  src: string;
  guestName?: string;
  category?: string;
  title?: string;
  frameZoom?: number;
  framePanX?: number;
  framePanY?: number;
};

export function buildSharedMemories(
  count = ITEM_COUNT,
  sources?: SharedMemorySource[],
): SharedMemory[] {
  const poolSources: SharedMemorySource[] =
    sources && sources.length > 0
      ? sources
      : SHARED_MEMORY_SOURCES.map((src) => ({ src }));

  const pool: SharedMemorySource[] = [];
  while (pool.length < count) pool.push(...poolSources);
  const picked = shuffleSeeded(pool).slice(0, count);

  return picked.map((source, i) => {
    const project = PROJECTS[i % PROJECTS.length];
    return {
      id: `memory-${i}`,
      src: source.src,
      guestName: source.guestName?.trim() || project.guestName,
      category: source.category?.trim() || project.category,
      title: source.title?.trim() || project.title,
      caption: project.caption,
      time: project.time,
      frameZoom: source.frameZoom,
      framePanX: source.framePanX,
      framePanY: source.framePanY,
    };
  });
}

export function guestByline(name: string) {
  const endsWithVowel = /[aeıioöuüAEIİOÖUÜ]$/.test(name);
  return `${name}'${endsWithVowel ? "nin" : "in"} gözünden`;
}
