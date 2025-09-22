import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { formatCompact } from "../dateUtils";

describe("formatCompact", () => {
  const NOW = new Date("2025-01-01T12:00:00.000Z");

  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("returns 0m for the same time (now)", () => {
    expect(formatCompact(new Date("2025-01-01T12:00:00.000Z"))).toBe("0m");
  });

  it("formats 1 minute ago as 1m (singular mapping)", () => {
    expect(formatCompact(new Date(NOW.getTime() - 1 * 60_000))).toBe("1m");
  });

  it("formats 5 minutes ago as 5m", () => {
    expect(formatCompact(new Date(NOW.getTime() - 5 * 60_000))).toBe("5m");
  });

  it("formats 59 minutes ago as 59m", () => {
    expect(formatCompact(new Date(NOW.getTime() - 59 * 60_000))).toBe("59m");
  });

  it("formats 90 minutes ago as 90m (still minutes due to unit:'minute')", () => {
    expect(formatCompact(new Date(NOW.getTime() - 90 * 60_000))).toBe("90m");
  });

  it("formats future times symmetrically (e.g., 10 minutes ahead as 10m)", () => {
    expect(formatCompact(new Date(NOW.getTime() + 10 * 60_000))).toBe("10m");
  });
});
