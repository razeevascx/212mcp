/**
 * Portfolio Feature Tools
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { PortfolioClient } from "./client.js";

export const portfolioTools: Tool[] = [
  {
    name: "fetch_open_positions",
    description:
      "Fetch open positions, optionally filtered by ticker. Response includes a summary and raw data.",
    inputSchema: {
      type: "object",
      properties: {
        ticker: { type: "string", description: "Optional ticker symbol filter" },
      },
      required: [],
    },
  },
];

export async function handleFetchOpenPositions(
  client: PortfolioClient,
  ticker?: string,
): Promise<string> {
  const positions = await client.fetchOpenPositions(ticker);
  const summary = positions.map((position) => ({
    ticker: position.ticker || position.instrument.ticker,
    quantity: position.quantity,
    currentPrice: position.currentPrice,
    currentValue: position.walletImpact.currentValue,
    unrealizedPl: position.walletImpact.unrealizedProfitLoss,
    currency: position.walletImpact.currency,
  }));
  return JSON.stringify({ summary, raw: positions }, null, 2);
}
