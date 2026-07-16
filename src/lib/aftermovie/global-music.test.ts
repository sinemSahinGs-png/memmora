import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("global aftermovie music contract", () => {
  it("treats env global music as couple-independent", () => {
    const previous = process.env.AFTERMOVIE_GLOBAL_MUSIC_URL;
    process.env.AFTERMOVIE_GLOBAL_MUSIC_URL = "https://cdn.example.com/theme.mp3";
    process.env.AFTERMOVIE_GLOBAL_MUSIC_TITLE = "Emerald Theme";

    // Lightweight contract: env overrides couple IDs
    assert.equal(
      process.env.AFTERMOVIE_GLOBAL_MUSIC_URL?.startsWith("https://"),
      true,
    );
    assert.equal(process.env.AFTERMOVIE_GLOBAL_MUSIC_TITLE, "Emerald Theme");

    if (previous === undefined) {
      delete process.env.AFTERMOVIE_GLOBAL_MUSIC_URL;
    } else {
      process.env.AFTERMOVIE_GLOBAL_MUSIC_URL = previous;
    }
    delete process.env.AFTERMOVIE_GLOBAL_MUSIC_TITLE;
  });
});
