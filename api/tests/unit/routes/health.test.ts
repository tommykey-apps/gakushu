import { describe, it, expect } from "vitest";

// health handler returns a plain object, so we can import and call directly
// Nitro's defineEventHandler wraps the fn; we import and test the module's default export
import handler from "../../../routes/health.get";

describe("GET /health", () => {
  it("returns status ok with timestamp", () => {
    // defineEventHandler returns the handler fn itself in h3
    const result = handler({} as any);
    expect(result).toHaveProperty("status", "ok");
    expect(result).toHaveProperty("timestamp");
    expect(typeof result.timestamp).toBe("string");
    // timestamp should be a valid ISO string
    expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
  });
});
