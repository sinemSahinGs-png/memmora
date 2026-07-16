import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isAftermoviePubliclyAvailable,
  isForbiddenMockVideoUrl,
  resolveAutoPublishPatch,
  resolveCoupleLifecycleMode,
} from "./lifecycle";
import type { CoupleAftermovie } from "./types";

function base(partial: Partial<CoupleAftermovie> = {}): CoupleAftermovie {
  return {
    id: "am-1",
    coupleId: "c-1",
    status: "ready",
    templateKey: "memoora-classic",
    title: "Test",
    openingText: "A & B",
    closingText: "Anılar yaşamaya devam ediyor.",
    posterMediaId: null,
    musicId: null,
    durationPreset: "standard",
    recommendedPublishAt: "2026-01-08T00:00:00.000Z",
    publishAt: "2026-01-08T00:00:00.000Z",
    approvedAt: "2026-01-07T00:00:00.000Z",
    publishedAt: null,
    submittedAt: null,
    revisionRequestedAt: null,
    revisionNote: null,
    revisionResolvedAt: null,
    productionNotes: null,
    finalVideoDurationSeconds: null,
    finalPosterUrl: null,
    finalPosterStorageKey: null,
    renderStartedAt: null,
    renderCompletedAt: "2026-01-07T00:00:00.000Z",
    finalVideoUrl: "/api/aftermovie/test/playback",
    finalVideoStorageKey: "drive-file-1",
    renderProvider: "manual",
    renderJobId: null,
    renderError: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-07T00:00:00.000Z",
    ...partial,
  };
}

describe("aftermovie lifecycle", () => {
  it("rejects living-tree mock URLs", () => {
    assert.equal(isForbiddenMockVideoUrl("/videos/living-tree-bg.mp4"), true);
    assert.equal(
      isForbiddenMockVideoUrl("/api/aftermovie/x/playback"),
      false,
    );
  });

  it("public mode unavailable before approval", () => {
    const now = new Date("2026-01-10T00:00:00.000Z");
    assert.equal(
      isAftermoviePubliclyAvailable(base({ approvedAt: null }), now),
      false,
    );
  });

  it("public mode unavailable before publish date", () => {
    const now = new Date("2026-01-01T00:00:00.000Z");
    assert.equal(isAftermoviePubliclyAvailable(base(), now), false);
  });

  it("public mode unavailable without final video", () => {
    const now = new Date("2026-01-10T00:00:00.000Z");
    assert.equal(
      isAftermoviePubliclyAvailable(
        base({ finalVideoUrl: null, finalVideoStorageKey: null }),
        now,
      ),
      false,
    );
  });

  it("public mode unavailable with mock video", () => {
    const now = new Date("2026-01-10T00:00:00.000Z");
    assert.equal(
      isAftermoviePubliclyAvailable(
        base({
          finalVideoUrl: "/videos/living-tree-bg.mp4",
          finalVideoStorageKey: null,
        }),
        now,
      ),
      false,
    );
  });

  it("public mode available when ready, approved and due", () => {
    const now = new Date("2026-01-10T00:00:00.000Z");
    assert.equal(isAftermoviePubliclyAvailable(base(), now), true);
  });

  it("revision request disables publication", () => {
    const now = new Date("2026-01-10T00:00:00.000Z");
    assert.equal(
      isAftermoviePubliclyAvailable(
        base({
          status: "revision_requested",
          revisionRequestedAt: now.toISOString(),
          approvedAt: null,
        }),
        now,
      ),
      false,
    );
  });

  it("keeps wedding lifecycle when film incomplete", () => {
    const mode = resolveCoupleLifecycleMode({
      weddingDate: "2026-08-22",
      aftermovie: base({
        status: "waiting_for_production",
        approvedAt: null,
        finalVideoUrl: null,
        finalVideoStorageKey: null,
      }),
      now: new Date("2026-08-30T12:00:00.000Z"),
    });
    assert.equal(mode, "rendering");
    assert.notEqual(mode, "post_wedding");
  });

  it("public mode available for approved slideshow film", () => {
    const now = new Date("2026-01-10T00:00:00.000Z");
    assert.equal(
      isAftermoviePubliclyAvailable(
        base({
          status: "scheduled",
          renderProvider: "slideshow",
          finalVideoUrl: "slideshow://memoora",
          finalVideoStorageKey: null,
          media: [
            {
              id: "1",
              aftermovieId: "am-1",
              mediaId: "m1",
              mediaType: "photo",
              sortOrder: 0,
              trimStartSeconds: null,
              trimEndSeconds: null,
              category: null,
              isPoster: true,
            },
          ],
        }),
        now,
      ),
      true,
    );
  });

  it("resolveAutoPublishPatch publishes when due", () => {
    const patch = resolveAutoPublishPatch({
      publishAt: "2026-01-01T00:00:00.000Z",
      now: new Date("2026-01-10T00:00:00.000Z"),
    });
    assert.equal(patch.status, "published");
    assert.ok(patch.published_at);
    assert.ok(patch.approved_at);
  });

  it("resolveAutoPublishPatch schedules when future", () => {
    const patch = resolveAutoPublishPatch({
      publishAt: "2026-12-01T00:00:00.000Z",
      now: new Date("2026-01-10T00:00:00.000Z"),
    });
    assert.equal(patch.status, "scheduled");
    assert.equal(patch.published_at, null);
  });
});
