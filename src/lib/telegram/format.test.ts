import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { escapeHtml, sanitizeErrorMessage } from "./format";

describe("telegram format", () => {
  it("escapes html special chars", () => {
    assert.equal(
      escapeHtml('Ata <test> & "x"'),
      "Ata &lt;test&gt; &amp; &quot;x&quot;",
    );
  });

  it("sanitizes secrets from error messages", () => {
    const msg = sanitizeErrorMessage(
      "Bearer eyJhbGciOiJIUzI1NiJ9.abc123.secret and sk_live_abc",
    );
    assert.equal(/eyJ/.test(msg), false);
    assert.equal(/sk_live/.test(msg), false);
    assert.match(msg, /\[redacted\]/);
  });
});
