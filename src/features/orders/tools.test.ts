import { describe, expect, test } from "bun:test";
import {
  handleFetchAllOrders,
  handlePlaceMarketOrder,
  type PlaceMarketOrderArgs,
} from "./tools.js";

describe("orders tools", () => {
  test("handleFetchAllOrders forwards params to client", async () => {
    const calls: unknown[] = [];
    const client = {
      fetchAllOrders: async (params: unknown) => {
        calls.push(params);
        return [{ id: 1 }];
      },
    } as const;

    const result = await handleFetchAllOrders(
      client as unknown as Parameters<typeof handleFetchAllOrders>[0],
      { status: "NEW", limit: 5 },
    );

    expect(calls).toEqual([{ status: "NEW", limit: 5 }]);
    expect(result).toContain('"id": 1');
  });

  test("handlePlaceMarketOrder passes negative quantity through", async () => {
    const calls: Array<[string, number, boolean | undefined]> = [];
    const client = {
      placeMarketOrder: async (
        ticker: string,
        quantity: number,
        extendedHours?: boolean,
      ) => {
        calls.push([ticker, quantity, extendedHours]);
        return { id: 22 };
      },
    } as const;

    const args: PlaceMarketOrderArgs = {
      ticker: "AAPL_US_EQ",
      quantity: -2,
      extendedHours: false,
    };
    const result = await handlePlaceMarketOrder(
      client as unknown as Parameters<typeof handlePlaceMarketOrder>[0],
      args,
    );

    expect(calls).toEqual([["AAPL_US_EQ", -2, false]]);
    expect(result).toContain('"id": 22');
  });
});
