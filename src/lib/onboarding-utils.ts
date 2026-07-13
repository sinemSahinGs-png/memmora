import { slugifyDisplayTitle } from "@/lib/slugify";

export function buildCoupleDisplayTitle(
  groomName: string,
  brideName: string
): string {
  const groom = groomName.trim();
  const bride = brideName.trim();
  if (groom && bride) return `${groom} & ${bride}`;
  return groom || bride || "Memoora Çifti";
}

export function slugifyCoupleNames(
  groomName: string,
  brideName: string
): string {
  return slugifyDisplayTitle(buildCoupleDisplayTitle(groomName, brideName));
}

/** 4-digit admin PIN (1000–9999). */
export function generateAdminPin(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

/** Append -2, -3 … when base slug is taken. */
export function resolveUniqueSlug(
  baseSlug: string,
  slugTaken: (slug: string) => Promise<boolean>
): Promise<string> {
  const base = baseSlug.trim().toLowerCase();
  if (!base) return Promise.reject(new Error("Slug boş olamaz."));

  return (async () => {
    if (!(await slugTaken(base))) return base;
    for (let i = 2; i < 1000; i++) {
      const candidate = `${base}-${i}`;
      if (!(await slugTaken(candidate))) return candidate;
    }
    throw new Error("Benzersiz slug üretilemedi.");
  })();
}

export function normalizeEmail(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed.toLowerCase();
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
