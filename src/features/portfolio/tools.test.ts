import { describe, expect, test } from "bun:test";
import { handleFetchOpenPositions } from "./tools.js";

describe("portfolio tools", () => {
  test("handleFetchOpenPositions shapes summary and includes raw", async () => {
    const client = {
      fetchOpenPositions: async () => [
        {
          ticker: "AAPL_US_EQ",
          instrument: { ticker: "AAPL_US_EQ" },
          quantity: 2,
          currentPrice: 100,
          walletImpact: {
            currentValue: 200,
            unrealizedProfitLoss: 12,
            currency: "USD",
          },
        },
      ],
    } as const;

    const result = await handleFetchOpenPositions(
      client as unknown as Parameters<typeof handleFetchOpenPositions>[0],
    );
    const parsed = JSON.parse(result) as {
      summary: Array<{ ticker: string; unrealizedPl: number }>;
      raw: unknown[];
    };

    expect(parsed.summary[0].ticker).toBe("AAPL_US_EQ");
    expect(parsed.summary[0].unrealizedPl).toBe(12);
    expect(parsed.raw.length).toBe(1);
  });
});
