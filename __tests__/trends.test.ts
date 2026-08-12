import { describe, expect, it } from "vitest";
import { percentChange } from "@/lib/calculations/trends";

describe("percentChange", () => {
  it("computes a straightforward increase", () => {
    const result = percentChange(150, 100);
    expect(result.percentage).toBeCloseTo(50);
    expect(result.direction).toBe("up");
  });

  it("computes a decrease", () => {
    const result = percentChange(80, 100);
    expect(result.percentage).toBeCloseTo(-20);
    expect(result.direction).toBe("down");
  });

  it("is flat when current equals previous", () => {
    const result = percentChange(100, 100);
    expect(result.percentage).toBe(0);
    expect(result.direction).toBe("flat");
  });

  it("returns flat/zero when both current and previous are zero", () => {
    const result = percentChange(0, 0);
    expect(result.percentage).toBe(0);
    expect(result.direction).toBe("flat");
  });

  it("returns null percentage when previous is zero but current is not (undefined % change)", () => {
    const up = percentChange(500, 0);
    expect(up.percentage).toBeNull();
    expect(up.direction).toBe("up");

    const down = percentChange(-500, 0);
    expect(down.percentage).toBeNull();
    expect(down.direction).toBe("down");
  });

  it("uses the absolute value of previous as the denominator so a negative baseline still reads sensibly", () => {
    // previous = -100 (e.g. account balance), current = -50 -> improved by 50%
    const result = percentChange(-50, -100);
    expect(result.percentage).toBeCloseTo(50);
    expect(result.direction).toBe("up");
  });
});
