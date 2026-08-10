/** Homepage product visual assets and metadata */

export const PRODUCT_ASSETS = {
  magnet: {
    id: "magnet" as const,
    src: "/images/memoora/products/memoora-leaf-magnet.png",
    alt: "Kişiye özel yaprak NFC magnet",
    label: "Kişiye Özel Magnet",
    shortLabel: "Magnet",
  },
  keychain: {
    id: "keychain" as const,
    src: "/images/memoora/products/memoora-leaf-keychain.png",
    alt: "Yaprak NFC anahtarlık",
    label: "Anahtarlık",
    shortLabel: "Anahtarlık",
  },
} as const;

export type ProductVisualId = keyof typeof PRODUCT_ASSETS;
