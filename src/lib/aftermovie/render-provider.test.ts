import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  getAftermovieRenderProvider,
  ManualAftermovieRenderProvider,
  MockAftermovieRenderProvider,
  resetAftermovieRenderProviderForTests,
} from "./render-provider";

const originalEnv = { ...process.env };

describe("aftermovie render providers", () => {
  beforeEach(() => {
    resetAftermovieRenderProviderForTests();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    resetAftermovieRenderProviderForTests();
    process.env = { ...originalEnv };
  });

  it("rejects mock provider in production", () => {
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "production",
      configurable: true,
    });
    process.env.AFTERMOVIE_RENDER_PROVIDER = "mock";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    assert.throws(() => getAftermovieRenderProvider(), /mock/i);
  });

  it("manual provider never returns a fake final URL", async () => {
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "production",
      configurable: true,
    });
    process.env.AFTERMOVIE_RENDER_PROVIDER = "manual";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    const provider = getAftermovieRenderProvider();
    assert.ok(provider instanceof ManualAftermovieRenderProvider);
    const queued = await provider.queueRender({
      aftermovieId: "a1",
      coupleId: "c1",
      media: [],
      title: "Test",
      weddingDate: "2026-08-22",
      durationPreset: "standard",
    });
    assert.equal(queued.awaitingManualProduction, true);
    const status = await provider.getRenderStatus(queued.jobId);
    assert.equal(status.state, "waiting_for_production");
    assert.equal(status.outputUrl, undefined);
  });

  it("allows mock only outside production when configured", async () => {
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "development",
      configurable: true,
    });
    process.env.AFTERMOVIE_RENDER_PROVIDER = "mock";
    const provider = getAftermovieRenderProvider();
    assert.ok(provider instanceof MockAftermovieRenderProvider);
    const queued = await provider.queueRender({
      aftermovieId: "a1",
      coupleId: "c1",
      media: [],
      title: "Test",
      weddingDate: "2026-08-22",
      durationPreset: "standard",
    });
    assert.equal(queued.provider, "mock");
  });
});
