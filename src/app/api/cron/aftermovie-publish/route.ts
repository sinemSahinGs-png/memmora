import { NextResponse } from "next/server";
import {
  listDueAftermoviesForPublish,
  markAftermoviePublishedIdempotent,
} from "@/lib/supabase/aftermovie";
import {
  getCronSecretOrThrowInProduction,
  isProductionRuntime,
} from "@/lib/aftermovie/env";
import { timingSafeBearerMatch } from "@/lib/auth/admin-session-cookie";
import { isForbiddenMockVideoUrl } from "@/lib/aftermovie/lifecycle";

/**
 * Vercel Cron / manual trigger.
 * Marks approved+ready aftermovies as published when publish_at has passed.
 * Fail-closed in production without CRON_SECRET.
 */
export async function GET(req: Request) {
  const secret = getCronSecretOrThrowInProduction();
  if (isProductionRuntime() && !secret) {
    return NextResponse.json(
      { error: "Cron misconfigured" },
      { status: 503 },
    );
  }
  if (secret && !timingSafeBearerMatch(req.headers.get("authorization"), secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const due = await listDueAftermoviesForPublish();
    const publishedIds: string[] = [];
    let skipped = 0;

    for (const item of due) {
      if (item.status === "published" || item.publishedAt) {
        skipped += 1;
        continue;
      }
      if (
        !item.finalVideoUrl ||
        isForbiddenMockVideoUrl(item.finalVideoUrl) ||
        !item.approvedAt
      ) {
        skipped += 1;
        continue;
      }

      const result = await markAftermoviePublishedIdempotent(item.id);
      if (result.published) {
        publishedIds.push(item.id);
      } else {
        skipped += 1;
      }
    }

    return NextResponse.json({
      ok: true,
      checked: due.length,
      publishedCount: publishedIds.length,
      skipped,
    });
  } catch (error) {
    console.error("[aftermovie publish cron]", error);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}
