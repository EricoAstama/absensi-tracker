import { describe, expect, it } from "vitest";
import { displaySlotStatus, getSlotStatusForMinutes, statusBadgeClass } from "./attendance";

describe("attendance status", () => {
  it("uses 12:00 as the lunch break target", () => {
    expect(getSlotStatusForMinutes(2, 719)).toBe("early_out");
    expect(getSlotStatusForMinutes(2, 720)).toBe("on_time");
  });

  it("marks departure after 16:30 as overtime", () => {
    expect(getSlotStatusForMinutes(4, 989)).toBe("early_out");
    expect(getSlotStatusForMinutes(4, 990)).toBe("on_time");
    expect(getSlotStatusForMinutes(4, 991)).toBe("overtime");
    expect(displaySlotStatus(4, "2026-11-16T09:31:00.000Z", "on_time")).toBe("overtime");
  });

  it("uses red for late and early departure pills", () => {
    expect(statusBadgeClass("late")).toContain("bg-red-50");
    expect(statusBadgeClass("early_out")).toContain("bg-red-50");
  });
});
