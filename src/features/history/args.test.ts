import { describe, expect, test } from "bun:test";
import { parseExportRequestArgs, parsePaginationArgs } from "./args.js";

describe("history args parsing", () => {
  test("parsePaginationArgs accepts cursor string or number", () => {
    expect(parsePaginationArgs({ cursor: "abc", limit: 10 })).toEqual({
      cursor: "abc",
      limit: 10,
      ticker: undefined,
      time: undefined,
    });
    expect(parsePaginationArgs({ cursor: 123 })).toEqual({
      cursor: 123,
      limit: undefined,
      ticker: undefined,
      time: undefined,
    });
  });

  test("parseExportRequestArgs validates booleans in dataIncluded", () => {
    const parsed = parseExportRequestArgs({
      dataIncluded: { includeOrders: true },
    });
    expect(parsed.dataIncluded?.includeOrders).toBe(true);
    expect(() =>
      parseExportRequestArgs({ dataIncluded: { includeOrders: "yes" } }),
    ).toThrow();
  });
});
