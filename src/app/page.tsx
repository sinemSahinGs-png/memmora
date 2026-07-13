import { MemooraHomePage } from "@/components/home/MemooraHomePage";
import { createSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";

const DEMO_SLUGS = ["berkin-beste", "mert-irem"];

async function getDemoCouples() {
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

export default async function HomePage() {
  const demos = await getDemoCouples();

  return <MemooraHomePage demos={demos} />;
}
