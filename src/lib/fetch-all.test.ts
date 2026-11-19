import { describe, expect, it } from "vitest";
import { fetchAll } from "./fetch-all";

describe("fetchAll", () => {
  it("loads every page beyond Supabase's first 1,000 rows", async () => {
    const source = Array.from({ length: 1001 }, (_, id) => ({ id }));
    const ranges: number[][] = [];
    const rows = await fetchAll(async (from, to) => {
      ranges.push([from, to]);
      return { data: source.slice(from, to + 1), error: null };
    });
    expect(rows).toEqual(source);
    expect(ranges).toEqual([[0, 499], [500, 999], [1000, 1499]]);
  });
});
