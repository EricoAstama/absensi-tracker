import { describe, expect, it } from "vitest";
import { exportDates } from "./export-period";

describe("export dates", () => {
  it("includes the chosen end date for each period", () => {
    expect(exportDates("2026-11-19")).toEqual(["2026-11-19"]);
    const week = exportDates("2026-01-03", "week");
    expect(week).toHaveLength(7);
    expect(week[0]).toBe("2025-12-28");
    expect(week[6]).toBe("2026-01-03");
    const month = exportDates("2024-03-01", "month");
    expect(month).toHaveLength(30);
    expect(month[0]).toBe("2024-02-01");
    expect(month).toContain("2024-02-29");
    expect(month[29]).toBe("2024-03-01");
  });
  it.each(["2026-02-30", "2026-13-01", "2026-1-1", "garbage", ""])("rejects invalid date %s", date => {
    expect(() => exportDates(date)).toThrow();
  });
  it.each(["year", "", "toString", "__proto__"])("rejects invalid period %s", period => {
    expect(() => exportDates("2026-11-19", period)).toThrow();
  });
});
