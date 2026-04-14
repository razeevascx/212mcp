/**
 * Instruments Feature Tools
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { InstrumentsClient } from "./client.js";
import { SearchInstrumentsParams } from "./types.js";

export interface SearchExchangeArgs {
  name?: string;
  id?: string;
}

export const instrumentsTools: Tool[] = [
  {
    name: "search_exchange",
    description: "Fetch exchanges, optionally filtered by name or ID",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Exchange name filter" },
        id: { type: "string", description: "Exchange ID filter" },
      },
    },
  },
  {
    name: "search_instrument",
    description: "Fetch instruments, optionally filtered by ticker or name",
    inputSchema: {
      type: "object",
      properties: {
        search: {
          type: "string",
          description: "Search by ticker, name, or ISIN",
        },
        type: {
          type: "string",
          description: "Instrument type (STOCK, ETF, FUND, etc.)",
        },
        market: { type: "string", description: "Market filter" },
        limit: { type: "number", description: "Max results (default: 50)" },
        offset: { type: "number", description: "Pagination offset" },
      },
      required: ["search"],
    },
  },
];

export async function handleSearchExchange(
  client: InstrumentsClient,
  params: SearchExchangeArgs = {},
): Promise<string> {
  const exchanges = await client.searchExchanges(params.name, params.id);
  return JSON.stringify(exchanges, null, 2);
}

export async function handleSearchInstrument(
  client: InstrumentsClient,
  params: SearchInstrumentsParams = {},
): Promise<string> {
  const instruments = await client.searchInstruments(params);
  return JSON.stringify(instruments, null, 2);
}
