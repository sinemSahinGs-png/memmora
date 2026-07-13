export const MEMORY_MIRROR_HOLD_PROGRESS = 0.5;

export function scrollToMemoryForm(): void {
  const el = document.getElementById("memory");
  if (!el) return;

  const vh = window.innerHeight;
  const scrollable = Math.max(0, el.offsetHeight - vh);
  const targetScroll =
    el.offsetTop + scrollable * MEMORY_MIRROR_HOLD_PROGRESS;

  window.scrollTo({
    top: Math.max(0, targetScroll),
    behavior: "smooth",
  });
}
