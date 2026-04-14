/**
 * Portfolio Feature Tools
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { PortfolioClient } from "./client.js";

export const portfolioTools: Tool[] = [
  {
    name: "fetch_open_positions",
    description: "Fetch all open positions",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "search_specific_position_by_ticker",
    description: "Search for a position by ticker using POST endpoint",
    inputSchema: {
      type: "object",
      properties: {
        ticker: { type: "string", description: "Ticker symbol" },
      },
      required: ["ticker"],
    },
  },
  {
    name: "fetch_open_position_by_ticker",
    description:
      "Fetch a position by ticker (deprecated, use search_specific_position_by_ticker)",
    inputSchema: {
      type: "object",
      properties: {
        ticker: { type: "string", description: "Ticker symbol" },
      },
      required: ["ticker"],
    },
  },
];

export async function handleFetchOpenPositions(
  client: PortfolioClient,
): Promise<string> {
  const positions = await client.fetchOpenPositions();
  return JSON.stringify(positions, null, 2);
}

export async function handleSearchSpecificPositionByTicker(
  client: PortfolioClient,
  ticker: string,
): Promise<string> {
  const positions = await client.searchSpecificPositionByTicker(ticker);
  return JSON.stringify(positions, null, 2);
}

export async function handleFetchOpenPositionByTicker(
  client: PortfolioClient,
  ticker: string,
): Promise<string> {
  const position = await client.fetchOpenPositionByTicker(ticker);
  return JSON.stringify(position, null, 2);
}
