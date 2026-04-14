#!/usr/bin/env node

/**
 * Trading 212 Model Context Protocol (MCP) Server
 * Exposes Trading 212 API as Claude tools for Claude Desktop integration
 */

import "dotenv/config.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { logger } from "@/utils/logger.js";
import { Trading212Error, ValidationError } from "@/utils/errors.js";

// Import feature clients
import { InstrumentsClient } from "@/features/instruments/client.js";
import { AccountsClient } from "@/features/accounts/client.js";
import { PortfolioClient } from "@/features/portfolio/client.js";
import { OrdersClient } from "@/features/orders/client.js";
import { PiesClient } from "@/features/pies/client.js";
import { HistoryClient } from "@/features/history/client.js";

// Import feature tools
import {
  instrumentsTools,
  handleSearchExchange,
  handleSearchInstrument,
  type SearchExchangeArgs,
} from "@/features/instruments/tools.js";
import {
  accountsTools,
  handleFetchAccountCash,
  handleFetchAccountMetadata,
} from "@/features/accounts/tools.js";
import {
  portfolioTools,
  handleFetchOpenPositions,
  handleSearchSpecificPositionByTicker,
  handleFetchOpenPositionByTicker,
} from "@/features/portfolio/tools.js";
import {
  ordersTools,
  handleFetchAllOrders,
  handleFetchOrder,
  handlePlaceLimitOrder,
  handlePlaceMarketOrder,
  handlePlaceStopOrder,
  handlePlaceStopLimitOrder,
  handleCancelOrder,
  type PlaceLimitOrderArgs,
  type PlaceMarketOrderArgs,
  type PlaceStopLimitOrderArgs,
  type PlaceStopOrderArgs,
} from "@/features/orders/tools.js";
import { type ListOrdersParams, type TimeValidity } from "@/features/orders/types.js";
import {
  piesTools,
  handleFetchPies,
  handleFetchPie,
  handleCreatePie,
  handleUpdatePie,
  handleDeletePie,
  handleDuplicatePie,
  type DuplicatePieArgs,
  type UpdatePieArgs,
} from "@/features/pies/tools.js";
import { type CreatePieRequest } from "@/features/pies/types.js";
import {
  historyTools,
  handleFetchHistoricalOrderData,
  handleFetchPaidOutDividends,
  handleFetchTransactionList,
  handleFetchExportsList,
  handleRequestExportCSV,
} from "@/features/history/tools.js";
import { type ExportRequestParams, type PaginationParams } from "@/features/history/types.js";

const server = new McpServer({
  name: "trading212-mcp",
  version: "1.0.0",
});

// Combine all feature tools
const allTools = [
  ...instrumentsTools,
  ...accountsTools,
  ...portfolioTools,
  ...ordersTools,
  ...piesTools,
  ...historyTools,
].map((tool) => ({
  name: tool.name,
  description: tool.description,
}));

type ToolArgs = Record<string, unknown>;
type ToolHandler = (args: unknown) => Promise<string>;
const ALLOWED_TIME_VALIDITY = new Set<TimeValidity>([
  "DAY",
  "GOOD_TILL_CANCEL",
]);

interface FeatureClients {
  instruments: InstrumentsClient;
  accounts: AccountsClient;
  portfolio: PortfolioClient;
  orders: OrdersClient;
  pies: PiesClient;
  history: HistoryClient;
}

let clients: FeatureClients | null = null;

function getClients(): FeatureClients {
  if (clients) {
    return clients;
  }

  clients = {
    instruments: new InstrumentsClient(),
    accounts: new AccountsClient(),
    portfolio: new PortfolioClient(),
    orders: new OrdersClient(),
    pies: new PiesClient(),
    history: new HistoryClient(),
  };

  return clients;
}

function asObjectArgs(args: unknown): ToolArgs {
  if (args === undefined) {
    return {};
  }

  if (typeof args === "object" && args !== null && !Array.isArray(args)) {
    return args as ToolArgs;
  }

  throw new ValidationError("Tool arguments must be an object");
}

function getRequiredStringArg(args: ToolArgs, key: string): string {
  const value = args[key];
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ValidationError(`Missing required string argument: ${key}`);
  }

  return value;
}

function getOptionalStringArg(args: ToolArgs, key: string): string | undefined {
  const value = args[key];
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new ValidationError(`Argument ${key} must be a string`);
  }

  return value;
}

function getRequiredNumberArg(args: ToolArgs, key: string): number {
  const value = args[key];
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new ValidationError(`Missing required number argument: ${key}`);
  }

  return value;
}

function getOptionalNumberArg(args: ToolArgs, key: string): number | undefined {
  const value = args[key];
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new ValidationError(`Argument ${key} must be a number`);
  }

  return value;
}

function parsePaginationArgs(args: ToolArgs): PaginationParams {
  const cursorRaw = args.cursor;
  const cursor =
    cursorRaw === undefined
      ? undefined
      : typeof cursorRaw === "string" || typeof cursorRaw === "number"
        ? cursorRaw
        : (() => {
            throw new ValidationError("Argument cursor must be a string or number");
          })();

  return {
    limit: getOptionalNumberArg(args, "limit"),
    cursor,
    ticker: getOptionalStringArg(args, "ticker"),
    time: getOptionalStringArg(args, "time"),
  };
}

function parseListOrdersArgs(_args: ToolArgs): ListOrdersParams {
  return {};
}

function getOptionalBooleanArg(args: ToolArgs, key: string): boolean | undefined {
  const value = args[key];
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== "boolean") {
    throw new ValidationError(`Argument ${key} must be a boolean`);
  }
  return value;
}

function getOptionalTimeValidityArg(
  args: ToolArgs,
  key: string,
): TimeValidity | undefined {
  const value = getOptionalStringArg(args, key);
  if (value === undefined) {
    return undefined;
  }
  if (!ALLOWED_TIME_VALIDITY.has(value as TimeValidity)) {
    throw new ValidationError(
      `Argument ${key} must be one of: DAY, GOOD_TILL_CANCEL`,
    );
  }
  return value as TimeValidity;
}

function parseExportRequestArgs(args: ToolArgs): ExportRequestParams {
  const dataIncludedArg = args.dataIncluded;
  if (
    dataIncludedArg !== undefined &&
    (typeof dataIncludedArg !== "object" ||
      dataIncludedArg === null ||
      Array.isArray(dataIncludedArg))
  ) {
    throw new ValidationError("Argument dataIncluded must be an object");
  }

  const dataIncluded = dataIncludedArg as
    | {
        includeOrders?: unknown;
        includeDividends?: unknown;
        includeTransactions?: unknown;
        includeInterest?: unknown;
      }
    | undefined;

  const parseOptionalBoolean = (value: unknown): boolean | undefined => {
    if (value === undefined) {
      return undefined;
    }
    if (typeof value !== "boolean") {
      throw new ValidationError("dataIncluded values must be boolean");
    }
    return value;
  };

  return {
    timeFrom: getOptionalStringArg(args, "timeFrom"),
    timeTo: getOptionalStringArg(args, "timeTo"),
    dataIncluded:
      dataIncluded === undefined
        ? undefined
        : {
            includeOrders: parseOptionalBoolean(dataIncluded.includeOrders),
            includeDividends: parseOptionalBoolean(dataIncluded.includeDividends),
            includeTransactions: parseOptionalBoolean(
              dataIncluded.includeTransactions,
            ),
            includeInterest: parseOptionalBoolean(dataIncluded.includeInterest),
          },
  };
}

function getOptionalNumberRecordArg(
  args: ToolArgs,
  key: string,
): Record<string, number> | undefined {
  const value = args[key];
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ValidationError(`Argument ${key} must be an object`);
  }

  const entries = Object.entries(value);
  for (const [, entryValue] of entries) {
    if (typeof entryValue !== "number" || Number.isNaN(entryValue)) {
      throw new ValidationError(`Argument ${key} must map string keys to numbers`);
    }
  }

  return Object.fromEntries(entries) as Record<string, number>;
}

function createToolHandlers(): Record<string, ToolHandler> {
  const featureClients = getClients();

  return {
    search_exchange: async (args) => {
      const parsed = asObjectArgs(args);
      const exchangeArgs: SearchExchangeArgs = {
        name: getOptionalStringArg(parsed, "name"),
        id: getOptionalStringArg(parsed, "id"),
      };
      return handleSearchExchange(featureClients.instruments, exchangeArgs);
    },
    search_instrument: async (args) => {
      const parsed = asObjectArgs(args);
      return handleSearchInstrument(featureClients.instruments, {
        search: getOptionalStringArg(parsed, "search"),
        type: getOptionalStringArg(parsed, "type"),
        market: getOptionalStringArg(parsed, "market"),
        limit: getOptionalNumberArg(parsed, "limit"),
        offset: getOptionalNumberArg(parsed, "offset"),
      });
    },
    fetch_account_cash: async () =>
      handleFetchAccountCash(featureClients.accounts),
    fetch_account_metadata: async () =>
      handleFetchAccountMetadata(featureClients.accounts),
    fetch_open_positions: async () =>
      handleFetchOpenPositions(featureClients.portfolio),
    search_specific_position_by_ticker: async (args) => {
      const parsed = asObjectArgs(args);
      return handleSearchSpecificPositionByTicker(
        featureClients.portfolio,
        getRequiredStringArg(parsed, "ticker"),
      );
    },
    fetch_open_position_by_ticker: async (args) => {
      const parsed = asObjectArgs(args);
      return handleFetchOpenPositionByTicker(
        featureClients.portfolio,
        getRequiredStringArg(parsed, "ticker"),
      );
    },
    fetch_all_orders: async (args) => {
      const parsed = asObjectArgs(args);
      return handleFetchAllOrders(
        featureClients.orders,
        parseListOrdersArgs(parsed),
      );
    },
    fetch_order: async (args) => {
      const parsed = asObjectArgs(args);
      return handleFetchOrder(
        featureClients.orders,
        getRequiredStringArg(parsed, "orderId"),
      );
    },
    place_limit_order: async (args) => {
      const parsed = asObjectArgs(args);
      const orderArgs: PlaceLimitOrderArgs = {
        ticker: getRequiredStringArg(parsed, "ticker"),
        quantity: getRequiredNumberArg(parsed, "quantity"),
        limitPrice: getRequiredNumberArg(parsed, "limitPrice"),
        timeValidity: getOptionalTimeValidityArg(parsed, "timeValidity"),
      };
      return handlePlaceLimitOrder(featureClients.orders, orderArgs);
    },
    place_market_order: async (args) => {
      const parsed = asObjectArgs(args);
      const orderArgs: PlaceMarketOrderArgs = {
        ticker: getRequiredStringArg(parsed, "ticker"),
        quantity: getRequiredNumberArg(parsed, "quantity"),
        extendedHours: getOptionalBooleanArg(parsed, "extendedHours"),
      };
      return handlePlaceMarketOrder(featureClients.orders, orderArgs);
    },
    place_stop_order: async (args) => {
      const parsed = asObjectArgs(args);
      const orderArgs: PlaceStopOrderArgs = {
        ticker: getRequiredStringArg(parsed, "ticker"),
        quantity: getRequiredNumberArg(parsed, "quantity"),
        stopPrice: getRequiredNumberArg(parsed, "stopPrice"),
        timeValidity: getOptionalTimeValidityArg(parsed, "timeValidity"),
      };
      return handlePlaceStopOrder(featureClients.orders, orderArgs);
    },
    place_stop_limit_order: async (args) => {
      const parsed = asObjectArgs(args);
      const orderArgs: PlaceStopLimitOrderArgs = {
        ticker: getRequiredStringArg(parsed, "ticker"),
        quantity: getRequiredNumberArg(parsed, "quantity"),
        stopPrice: getRequiredNumberArg(parsed, "stopPrice"),
        limitPrice: getRequiredNumberArg(parsed, "limitPrice"),
        timeValidity: getOptionalTimeValidityArg(parsed, "timeValidity"),
      };
      return handlePlaceStopLimitOrder(featureClients.orders, orderArgs);
    },
    cancel_order: async (args) => {
      const parsed = asObjectArgs(args);
      return handleCancelOrder(
        featureClients.orders,
        getRequiredStringArg(parsed, "orderId"),
      );
    },
    fetch_pies: async () => handleFetchPies(featureClients.pies),
    create_pie: async (args) => {
      const parsed = asObjectArgs(args);
      const pieArgs: CreatePieRequest = {
        name: getRequiredStringArg(parsed, "name"),
        icon: getOptionalStringArg(parsed, "icon"),
        goal: getOptionalNumberArg(parsed, "goal"),
        endDate: getOptionalStringArg(parsed, "endDate"),
        dividendCashAction: getOptionalStringArg(
          parsed,
          "dividendCashAction",
        ) as "REINVEST" | "TO_ACCOUNT_CASH" | undefined,
        instrumentShares: getOptionalNumberRecordArg(parsed, "instrumentShares"),
      };
      return handleCreatePie(featureClients.pies, pieArgs);
    },
    fetch_pie: async (args) => {
      const parsed = asObjectArgs(args);
      return handleFetchPie(
        featureClients.pies,
        getRequiredStringArg(parsed, "pieId"),
      );
    },
    update_pie: async (args) => {
      const parsed = asObjectArgs(args);
      const pieArgs: UpdatePieArgs = {
        pieId: getRequiredStringArg(parsed, "pieId"),
        name: getOptionalStringArg(parsed, "name"),
        icon: getOptionalStringArg(parsed, "icon"),
        goal: getOptionalNumberArg(parsed, "goal"),
        endDate: getOptionalStringArg(parsed, "endDate"),
        dividendCashAction: getOptionalStringArg(
          parsed,
          "dividendCashAction",
        ) as "REINVEST" | "TO_ACCOUNT_CASH" | undefined,
        instrumentShares: getOptionalNumberRecordArg(parsed, "instrumentShares"),
      };
      return handleUpdatePie(featureClients.pies, pieArgs);
    },
    delete_pie: async (args) => {
      const parsed = asObjectArgs(args);
      return handleDeletePie(
        featureClients.pies,
        getRequiredStringArg(parsed, "pieId"),
      );
    },
    duplicate_pie: async (args) => {
      const parsed = asObjectArgs(args);
      const duplicatePieArgs: DuplicatePieArgs = {
        pieId: getRequiredStringArg(parsed, "pieId"),
        name: getRequiredStringArg(parsed, "name"),
        icon: getOptionalStringArg(parsed, "icon"),
      };
      return handleDuplicatePie(featureClients.pies, duplicatePieArgs);
    },
    fetch_historical_order_data: async (args) => {
      const parsed = asObjectArgs(args);
      return handleFetchHistoricalOrderData(
        featureClients.history,
        parsePaginationArgs(parsed),
      );
    },
    fetch_paid_out_dividends: async (args) => {
      const parsed = asObjectArgs(args);
      return handleFetchPaidOutDividends(
        featureClients.history,
        parsePaginationArgs(parsed),
      );
    },
    fetch_transaction_list: async (args) => {
      const parsed = asObjectArgs(args);
      return handleFetchTransactionList(
        featureClients.history,
        parsePaginationArgs(parsed),
      );
    },
    fetch_exports_list: async () =>
      handleFetchExportsList(featureClients.history),
    request_export_csv: async (args) => {
      const parsed = asObjectArgs(args);
      return handleRequestExportCSV(
        featureClients.history,
        parseExportRequestArgs(parsed),
      );
    },
  };
}

function asStructuredContent(result: string): Record<string, unknown> | undefined {
  try {
    const parsed = JSON.parse(result) as unknown;
    if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return { data: parsed };
  } catch {
    return undefined;
  }
}

function registerTools(): void {
  const toolHandlers = createToolHandlers();
  const legacyInputSchema = z.object({}).passthrough();

  for (const tool of allTools) {
    const toolName = tool.name;
    const handler = toolHandlers[toolName];
    if (!handler) {
      logger.warn("Tool definition has no handler", { toolName });
      continue;
    }

    server.registerTool(
      toolName,
      {
        title: toolName,
        description: tool.description,
        inputSchema: legacyInputSchema,
      },
      async (args) => {
        logger.info("Tool called", { toolName });

        try {
          const result = await handler(args);
          const structuredContent = asStructuredContent(result);
          return {
            content: [{ type: "text", text: result }],
            ...(structuredContent ? { structuredContent } : {}),
          };
        } catch (error) {
          const errorPayload =
            error instanceof Trading212Error
              ? error.toJSON()
              : {
                  message: error instanceof Error ? error.message : String(error),
                };

          logger.error("Tool execution failed", {
            toolName,
            error: errorPayload,
          });

          return {
            isError: true,
            content: [
              {
                type: "text",
                text: `Error executing tool: ${
                  error instanceof Error ? error.message : String(error)
                }`,
              },
            ],
          };
        }
      },
    );
  }

  // A fully schema-validated tool using registerTool + zod with structured output.
  server.registerTool(
    "get_server_health",
    {
      title: "Get server health",
      description:
        "Return MCP server health, environment configuration, and optional tool inventory.",
      inputSchema: z.object({
        includeTools: z.boolean().optional().default(false),
      }),
      outputSchema: z.object({
        status: z.literal("ok"),
        name: z.string(),
        version: z.string(),
        environment: z.enum(["live", "demo"]),
        transport: z.literal("stdio"),
        toolCount: z.number(),
        tools: z.array(z.string()).optional(),
      }),
    },
    async ({ includeTools }) => {
      const environment = (process.env.ENVIRONMENT || "live").toLowerCase();
      if (environment !== "live" && environment !== "demo") {
        throw new ValidationError('ENVIRONMENT must be either "live" or "demo"');
      }

      const payload = {
        status: "ok" as const,
        name: "trading212-mcp",
        version: "1.0.0",
        environment,
        transport: "stdio" as const,
        toolCount: allTools.length + 1,
        ...(includeTools
          ? { tools: [...allTools.map((t) => t.name), "get_server_health"] }
          : {}),
      };

      return {
        structuredContent: payload,
        content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      };
    },
  );
}

/**
 * Start the server
 */
async function main(): Promise<void> {
  logger.info("Starting Trading 212 MCP Server...");

  const transportType = (process.env.TRANSPORT || "stdio").toLowerCase();
  if (transportType !== "stdio") {
    throw new ValidationError(
      `Unsupported TRANSPORT: ${transportType}. Only "stdio" is supported`,
    );
  }

  const environment = (process.env.ENVIRONMENT || "live").toLowerCase();
  if (environment !== "live" && environment !== "demo") {
    throw new ValidationError('ENVIRONMENT must be either "live" or "demo"');
  }

  registerTools();
  const transport = new StdioServerTransport();
  await server.connect(transport);

  logger.info("Trading 212 MCP Server running", {
    environment,
    transport: transportType,
    tools: allTools.length + 1,
    features: [
      "instruments",
      "accounts",
      "portfolio",
      "orders",
      "pies",
      "history",
    ],
    available: [...allTools.map((t) => t.name), "get_server_health"].join(", "),
  });
}

main().catch((error) => {
  logger.error("Server startup failed", { error: String(error) });
  process.exit(1);
});
