/**
 * History Feature Tools
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { HistoryClient } from "./client.js";
import { ExportRequestParams, PaginationParams } from "./types.js";

export const historyTools: Tool[] = [
  {
    name: "fetch_historical_order_data",
    description: "Fetch historical order data with pagination",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Max results (default: 20, max: 50)" },
        cursor: {
          oneOf: [{ type: "string" }, { type: "number" }],
          description: "Cursor from previous response's nextPagePath",
        },
        ticker: {
          type: "string",
          description: "Optional ticker filter",
        },
      },
    },
  },
  {
    name: "fetch_paid_out_dividends",
    description: "Fetch historical dividend data with pagination",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Max results (default: 20, max: 50)" },
        cursor: {
          oneOf: [{ type: "string" }, { type: "number" }],
          description: "Cursor from previous response's nextPagePath",
        },
        ticker: {
          type: "string",
          description: "Optional ticker filter",
        },
      },
    },
  },
  {
    name: "fetch_transaction_list",
    description:
      "Fetch transaction list (deposits, withdrawals, dividends, fees)",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Max results (default: 20, max: 50)" },
        cursor: {
          type: "string",
          description: "Cursor from previous response's nextPagePath",
        },
        time: {
          type: "string",
          description: "Retrieve transactions from this ISO datetime",
        },
      },
    },
  },
  {
    name: "fetch_exports_list",
    description: "List detailed information about all CSV account exports",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "request_export_csv",
    description:
      "Request a CSV export of the account's orders, dividends and transactions history",
    inputSchema: {
      type: "object",
      properties: {
        timeFrom: { type: "string", description: "ISO datetime start bound" },
        timeTo: { type: "string", description: "ISO datetime end bound" },
        dataIncluded: {
          type: "object",
          properties: {
            includeOrders: { type: "boolean" },
            includeDividends: { type: "boolean" },
            includeTransactions: { type: "boolean" },
            includeInterest: { type: "boolean" },
          },
        },
      },
    },
  },
];

export async function handleFetchHistoricalOrderData(
  client: HistoryClient,
  params: PaginationParams = {},
): Promise<string> {
  const orders = await client.fetchHistoricalOrderData(params);
  return JSON.stringify(orders, null, 2);
}

export async function handleFetchPaidOutDividends(
  client: HistoryClient,
  params: PaginationParams = {},
): Promise<string> {
  const dividends = await client.fetchPaidOutDividends(params);
  return JSON.stringify(dividends, null, 2);
}

export async function handleFetchTransactionList(
  client: HistoryClient,
  params: PaginationParams = {},
): Promise<string> {
  const transactions = await client.fetchTransactionList(params);
  return JSON.stringify(transactions, null, 2);
}

export async function handleFetchExportsList(
  client: HistoryClient,
): Promise<string> {
  const exports = await client.fetchExportsList();
  return JSON.stringify(exports, null, 2);
}

export async function handleRequestExportCSV(
  client: HistoryClient,
  params: ExportRequestParams = {},
): Promise<string> {
  const exportData = await client.requestExportCSV(params);
  return JSON.stringify(exportData, null, 2);
}
