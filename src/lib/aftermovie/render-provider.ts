import type {
  AftermovieRenderInput,
  AftermovieRenderResult,
  AftermovieRenderStatus,
} from "./types";
import {
  assertAftermovieEnvForProvider,
  getConfiguredAftermovieProviderMode,
  isProductionRuntime,
} from "./env";

export interface AftermovieRenderProvider {
  readonly name: string;
  queueRender(input: AftermovieRenderInput): Promise<AftermovieRenderResult>;
  getRenderStatus(jobId: string): Promise<AftermovieRenderStatus>;
  cancelRender(jobId: string): Promise<void>;
  retryRender(jobId: string): Promise<AftermovieRenderResult>;
}

/**
 * Development-only provider. Must never write living-tree-bg into production DB.
 */
export class MockAftermovieRenderProvider implements AftermovieRenderProvider {
  readonly name = "mock";
  private jobs = new Map<string, AftermovieRenderStatus>();

  async queueRender(input: AftermovieRenderInput): Promise<AftermovieRenderResult> {
    if (isProductionRuntime()) {
      throw new Error("Mock aftermovie provider is forbidden in production.");
    }

    const jobId = `mock_${input.aftermovieId}_${Date.now()}`;
    this.jobs.set(jobId, {
      jobId,
      state: "rendering",
      progress: 0.2,
    });

    setTimeout(() => {
      this.jobs.set(jobId, {
        jobId,
        state: "ready",
        progress: 1,
        // Dev stand-in only — APIs must refuse writing this URL in production.
        outputUrl: "/videos/living-tree-bg.mp4",
      });
    }, 2500);

    return { jobId, provider: this.name };
  }

  async getRenderStatus(jobId: string): Promise<AftermovieRenderStatus> {
    if (isProductionRuntime()) {
      return {
        jobId,
        state: "failed",
        error: "Mock aftermovie provider is forbidden in production.",
      };
    }
    return (
      this.jobs.get(jobId) ?? {
        jobId,
        state: "failed",
        error: "Job not found",
      }
    );
  }

  async cancelRender(jobId: string): Promise<void> {
    this.jobs.delete(jobId);
  }

  async retryRender(jobId: string): Promise<AftermovieRenderResult> {
    return this.queueRender({
      aftermovieId: jobId,
      coupleId: "retry",
      media: [],
      title: "Retry",
      weddingDate: new Date().toISOString().slice(0, 10),
      durationPreset: "standard",
    });
  }
}

/**
 * Production-safe provider before Remotion/FFmpeg worker exists.
 * Never invents a final video URL.
 */
export class ManualAftermovieRenderProvider implements AftermovieRenderProvider {
  readonly name = "manual";

  async queueRender(input: AftermovieRenderInput): Promise<AftermovieRenderResult> {
    return {
      jobId: `manual_${input.aftermovieId}_${Date.now()}`,
      provider: this.name,
      awaitingManualProduction: true,
    };
  }

  async getRenderStatus(jobId: string): Promise<AftermovieRenderStatus> {
    return {
      jobId,
      state: "waiting_for_production",
      progress: 0,
    };
  }

  async cancelRender(_jobId: string): Promise<void> {
    /* no-op */
  }

  async retryRender(jobId: string): Promise<AftermovieRenderResult> {
    return this.queueRender({
      aftermovieId: jobId,
      coupleId: "retry",
      media: [],
      title: "Retry",
      weddingDate: new Date().toISOString().slice(0, 10),
      durationPreset: "standard",
    });
  }
}

let singleton: AftermovieRenderProvider | null = null;

/** Test helper — clears singleton between test cases. */
export function resetAftermovieRenderProviderForTests(): void {
  singleton = null;
}

export function getAftermovieRenderProvider(): AftermovieRenderProvider {
  if (singleton) return singleton;

  const mode = assertAftermovieEnvForProvider();

  if (mode === "manual") {
    singleton = new ManualAftermovieRenderProvider();
    return singleton;
  }

  if (mode === "mock") {
    if (isProductionRuntime()) {
      throw new Error("Mock aftermovie provider rejected in production.");
    }
    singleton = new MockAftermovieRenderProvider();
    return singleton;
  }

  // remotion not wired — hard fail rather than silent mock
  throw new Error(
    "AFTERMOVIE_RENDER_PROVIDER=remotion is not configured. Use manual.",
  );
}

export function getProviderModeLabel(): string {
  const mode = getConfiguredAftermovieProviderMode();
  if (mode === "manual") return "Manuel prodüksiyon";
  if (mode === "mock") return "Geliştirme (mock)";
  return mode;
}
