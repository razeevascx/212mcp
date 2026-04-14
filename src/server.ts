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
import { validateAuthCredentials } from "@/utils/auth.js";

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
} from "@/features/instruments/tools.js";
import {
  accountsTools,
  handleFetchAccountCash,
  handleFetchAccountMetadata,
} from "@/features/accounts/tools.js";
import {
  portfolioTools,
  handleFetchOpenPositions,
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
} from "@/features/orders/tools.js";
import {
  piesTools,
  handleFetchPies,
  handleFetchPie,
  handleCreatePie,
  handleUpdatePie,
  handleDeletePie,
  handleDuplicatePie,
} from "@/features/pies/tools.js";
import {
  historyTools,
  handleFetchHistoricalOrderData,
  handleFetchPaidOutDividends,
  handleFetchTransactionList,
  handleFetchExportsList,
  handleRequestExportCSV,
} from "@/features/history/tools.js";
import { parseSearchExchangeArgs, parseSearchInstrumentArgs } from "@/features/instruments/args.js";
import {
  parseListOrdersArgs,
  parseOrderIdArg,
  parsePlaceLimitOrderArgs,
  parsePlaceMarketOrderArgs,
  parsePlaceStopLimitOrderArgs,
  parsePlaceStopOrderArgs,
} from "@/features/orders/args.js";
import {
  parseCreatePieArgs,
  parseDuplicatePieArgs,
  parsePieIdArg,
  parseUpdatePieArgs,
} from "@/features/pies/args.js";
import {
  parseExportRequestArgs,
  parsePaginationArgs,
} from "@/features/history/args.js";
import { parseOptionalTickerArg } from "@/features/portfolio/args.js";

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

function createToolHandlers(): Record<string, ToolHandler> {
  const featureClients = getClients();

  return {
    search_exchange: async (args) =>
      handleSearchExchange(
        featureClients.instruments,
        parseSearchExchangeArgs(args),
      ),
    search_instrument: async (args) =>
      handleSearchInstrument(
        featureClients.instruments,
        parseSearchInstrumentArgs(args),
      ),
    fetch_account_cash: async () =>
      handleFetchAccountCash(featureClients.accounts),
    fetch_account_metadata: async () =>
      handleFetchAccountMetadata(featureClients.accounts),
    fetch_open_positions: async (args) =>
      handleFetchOpenPositions(
        featureClients.portfolio,
        parseOptionalTickerArg(args),
      ),
    fetch_all_orders: async (args) =>
      handleFetchAllOrders(featureClients.orders, parseListOrdersArgs(args)),
    fetch_order: async (args) =>
      handleFetchOrder(featureClients.orders, parseOrderIdArg(args)),
    place_limit_order: async (args) =>
      handlePlaceLimitOrder(featureClients.orders, parsePlaceLimitOrderArgs(args)),
    place_market_order: async (args) =>
      handlePlaceMarketOrder(featureClients.orders, parsePlaceMarketOrderArgs(args)),
    place_stop_order: async (args) =>
      handlePlaceStopOrder(featureClients.orders, parsePlaceStopOrderArgs(args)),
    place_stop_limit_order: async (args) =>
      handlePlaceStopLimitOrder(
        featureClients.orders,
        parsePlaceStopLimitOrderArgs(args),
      ),
    cancel_order: async (args) =>
      handleCancelOrder(featureClients.orders, parseOrderIdArg(args)),
    fetch_pies: async () => handleFetchPies(featureClients.pies),
    create_pie: async (args) =>
      handleCreatePie(featureClients.pies, parseCreatePieArgs(args)),
    fetch_pie: async (args) =>
      handleFetchPie(featureClients.pies, parsePieIdArg(args)),
    update_pie: async (args) =>
      handleUpdatePie(featureClients.pies, parseUpdatePieArgs(args)),
    delete_pie: async (args) =>
      handleDeletePie(featureClients.pies, parsePieIdArg(args)),
    duplicate_pie: async (args) =>
      handleDuplicatePie(featureClients.pies, parseDuplicatePieArgs(args)),
    fetch_historical_order_data: async (args) =>
      handleFetchHistoricalOrderData(
        featureClients.history,
        parsePaginationArgs(args),
      ),
    fetch_paid_out_dividends: async (args) =>
      handleFetchPaidOutDividends(
        featureClients.history,
        parsePaginationArgs(args),
      ),
    fetch_transaction_list: async (args) =>
      handleFetchTransactionList(
        featureClients.history,
        parsePaginationArgs(args),
      ),
    fetch_exports_list: async () =>
      handleFetchExportsList(featureClients.history),
    request_export_csv: async (args) =>
      handleRequestExportCSV(featureClients.history, parseExportRequestArgs(args)),
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
  const registerToolUntyped = server.registerTool.bind(server) as (
    name: string,
    config: {
      title: string;
      description: string;
      inputSchema: unknown;
      outputSchema?: unknown;
    },
    handler: (args: unknown) => Promise<{
      content: Array<{ type: "text"; text: string }>;
      structuredContent?: Record<string, unknown>;
      isError?: boolean;
    }>,
  ) => void;

  for (const tool of allTools) {
    const toolName = tool.name;
    const handler = toolHandlers[toolName];
    if (!handler) {
      logger.warn("Tool definition has no handler", { toolName });
      continue;
    }

    registerToolUntyped(
      toolName,
      {
        title: toolName,
        description: tool.description ?? "",
        inputSchema: legacyInputSchema,
      },
      async (args) => {
        const parsedArgs = asObjectArgs(args);
        logger.info("Tool called", { toolName });

        try {
          const result = await handler(parsedArgs);
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
  registerToolUntyped(
    "get_server_health",
    {
      title: "Get server health",
      description:
        "Return MCP server health, environment configuration, and optional tool inventory.",
      inputSchema: legacyInputSchema,
    },
    async (args) => {
      const parsedArgs = asObjectArgs(args);
      const includeTools =
        typeof parsedArgs.includeTools === "boolean"
          ? parsedArgs.includeTools
          : false;
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
  validateAuthCredentials();

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
