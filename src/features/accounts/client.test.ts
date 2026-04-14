import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { AccountsClient } from "./client.js";

describe("AccountsClient", () => {
  const originalEnv = { ...process.env };
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.TRADING212_API_KEY = "key";
    process.env.TRADING212_API_SECRET = "secret";
    process.env.ENVIRONMENT = "live";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    globalThis.fetch = originalFetch;
    mock.restore();
  });

  test("fetchAccountCash calls dedicated /equity/account/cash endpoint", async () => {
    let calledUrl = "";
    globalThis.fetch = mock(async (url) => {
      calledUrl = String(url);
      return new Response(
        JSON.stringify({
          availableToTrade: 10,
          inPies: 2,
          reservedForOrders: 1,
        }),
        { status: 200 },
      );
    }) as unknown as typeof fetch;

    const client = new AccountsClient();
    const cash = await client.fetchAccountCash();

    expect(calledUrl).toContain("/equity/account/cash");
    expect(cash.availableToTrade).toBe(10);
  });
});
