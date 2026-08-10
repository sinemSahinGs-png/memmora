import { MemooraHomePage } from "@/components/home/MemooraHomePage";
import type { SharedMemorySource } from "@/components/home/shared-memories-data";
import type { HomeDemoCouple } from "@/lib/home-content";
import { createSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { fetchActiveHomepageMemories } from "@/lib/supabase/homepage-memories";

const DEMO_SLUGS = ["berkin-beste", "mert-irem"];

async function getDemoCouples(): Promise<HomeDemoCouple[]> {
  if (!isSupabaseConfigured()) {
    return DEMO_SLUGS.map((slug) => ({
      slug,
      title: slug.replace(/-/g, " & "),
    }));
  }

  const supabase = createSupabaseClient();
  const { data } = await supabase
    .from("couples")
    .select("slug, display_title, names")
    .in("slug", DEMO_SLUGS)
    .is("deleted_at", null);

  const found = (data ?? []).map((row) => ({
    slug: row.slug,
    title: row.display_title ?? row.names,
  }));

  if (found.length > 0) return found;

  return DEMO_SLUGS.map((slug) => ({
    slug,
    title: slug.replace(/-/g, " & "),
  }));
}

async function getHomepageMemorySources(): Promise<SharedMemorySource[]> {
  const rows = await fetchActiveHomepageMemories();
  return rows.map((row) => ({
    src: row.publicUrl,
    guestName: row.guestName,
    category: row.category,
    title: row.title,
    frameZoom: row.frameZoom,
    framePanX: row.framePanX,
    framePanY: row.framePanY,
  }));
}

export default async function HomePage() {
  const [demos, memorySources] = await Promise.all([
    getDemoCouples(),
    getHomepageMemorySources(),
  ]);

  return (
    <MemooraHomePage
      demos={demos}
      memorySources={memorySources.length > 0 ? memorySources : undefined}
    />
  );
}
