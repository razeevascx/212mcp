import { describe, expect, test } from "bun:test";
import { parseSearchExchangeArgs, parseSearchInstrumentArgs } from "./args.js";

describe("instruments args parsing", () => {
  test("parseSearchExchangeArgs supports optional filters", () => {
    expect(parseSearchExchangeArgs({ name: "NYSE", id: "10" })).toEqual({
      name: "NYSE",
      id: "10",
    });
    expect(parseSearchExchangeArgs({})).toEqual({ name: undefined, id: undefined });
  });

  test("parseSearchInstrumentArgs validates numeric fields", () => {
    const parsed = parseSearchInstrumentArgs({ search: "AAPL", limit: 5, offset: 2 });
    expect(parsed).toEqual({
      search: "AAPL",
      type: undefined,
      market: undefined,
      limit: 5,
      offset: 2,
    });
    expect(() => parseSearchInstrumentArgs({ limit: "10" })).toThrow();
  });
});
