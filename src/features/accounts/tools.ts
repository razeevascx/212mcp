/**
 * Accounts Feature Tools
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { AccountsClient } from "./client.js";

export const accountsTools: Tool[] = [
  {
    name: "fetch_account_cash",
    description: "Fetch account cash balance",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "fetch_account_metadata",
    description: "Fetch account ID and currency",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
];

export async function handleFetchAccountCash(
  client: AccountsClient,
): Promise<string> {
  const cash = await client.fetchAccountCash();
  return JSON.stringify(cash, null, 2);
}

export async function handleFetchAccountMetadata(
  client: AccountsClient,
): Promise<string> {
  const metadata = await client.fetchAccountMetadata();
  return JSON.stringify(metadata, null, 2);
}
