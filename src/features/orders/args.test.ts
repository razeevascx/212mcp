import { describe, expect, test } from "bun:test";
import {
  parseListOrdersArgs,
  parsePlaceMarketOrderArgs,
  parseOrderIdArg,
} from "./args.js";

describe("orders args parsing", () => {
  test("parseListOrdersArgs parses valid filters", () => {
    const parsed = parseListOrdersArgs({ status: "NEW", limit: 20 });
    expect(parsed).toEqual({ status: "NEW", limit: 20 });
  });

  test("parseListOrdersArgs rejects invalid status", () => {
    expect(() => parseListOrdersArgs({ status: "BOGUS" })).toThrow();
  });

  test("parsePlaceMarketOrderArgs rejects zero quantity", () => {
    expect(() =>
      parsePlaceMarketOrderArgs({ ticker: "AAPL_US_EQ", quantity: 0 }),
    ).toThrow();
  });

  test("parseOrderIdArg enforces required orderId", () => {
    expect(() => parseOrderIdArg({})).toThrow();
  });
});
