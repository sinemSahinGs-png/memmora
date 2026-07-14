export type SharedMemory = {
  id: string;
  src: string;
  guestName: string;
  category: string;
  title: string;
  caption?: string;
  time?: string;
  objectPosition?: string;
};

const SOURCES = [
  "/assets/memories/shared-01.jpg",
  "/assets/memories/shared-02.jpg",
  "/assets/memories/shared-03.jpg",
  "/assets/memories/shared-04.jpg",
  "/assets/memories/shared-05.jpg",
  "/assets/memories/shared-06.jpg",
  "/assets/memories/wedding-01.jpg",
  "/assets/memories/wedding-02.jpg",
  "/assets/memories/wedding-03.jpg",
  "/assets/memories/wedding-04.jpg",
  "/assets/memories/wedding-05.jpg",
  "/assets/memories/wedding-06.jpg",
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
  {
    guestName: "Ece",
    category: "İlk Dans",
    title: "Yavaş dans",
    caption: "Dans pistine ilk çıktıkları an.",
    time: "22:55",
  },
  {
    guestName: "Kerem",
    category: "Arkadaşlar",
    title: "Grup karesi",
    caption: "Gecenin en kalabalık karesi.",
    time: "23:40",
  },
  {
    guestName: "Zeynep",
    category: "Hazırlık",
    title: "Detaylar",
    caption: "Törenden hemen önce.",
    time: "16:50",
  },
  {
    guestName: "Burak",
    category: "Nikâh",
    title: "Yüzük",
    caption: "Evet demeden bir saniye önce.",
    time: "19:20",
  },
  {
    guestName: "Selin",
    category: "Aile",
    title: "Kucaklaşma",
    caption: "Annelerin gözleri dolarken.",
    time: "20:05",
  },
] as const;

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

export function buildSharedMemories(count = ITEM_COUNT): SharedMemory[] {
  const pool: string[] = [];
  while (pool.length < count) pool.push(...SOURCES);
  const images = shuffleSeeded(pool).slice(0, count);

  return images.map((src, i) => {
    const project = PROJECTS[i % PROJECTS.length];
    return {
      id: `memory-${i}`,
      src,
      guestName: project.guestName,
      category: project.category,
      title: project.title,
      caption: project.caption,
      time: project.time,
    };
  });
}

export function guestByline(name: string) {
  const endsWithVowel = /[aeıioöuüAEIİOÖUÜ]$/.test(name);
  return `${name}'${endsWithVowel ? "nin" : "in"} gözünden`;
}
