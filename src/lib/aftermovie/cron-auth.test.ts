import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  getCronSecretOrThrowInProduction,
  isProductionRuntime,
} from "./env";
import { timingSafeBearerMatch } from "@/lib/auth/admin-session-cookie";

const originalEnv = { ...process.env };

describe("cron security helpers", () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("fails closed without secret in production", () => {
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "production",
      configurable: true,
    });
    delete process.env.CRON_SECRET;
    assert.equal(isProductionRuntime(), true);
    assert.equal(getCronSecretOrThrowInProduction(), null);
  });

  it("rejects incorrect bearer secret", () => {
    process.env.CRON_SECRET = "correct-secret";
    assert.equal(
      timingSafeBearerMatch("Bearer wrong-secret", "correct-secret"),
      false,
    );
    assert.equal(
      timingSafeBearerMatch("Bearer correct-secret", "correct-secret"),
      true,
    );
  });
});
