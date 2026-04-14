/**
 * Orders Feature Tools
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { OrdersClient } from "./client.js";
import { ListOrdersParams, TimeValidity } from "./types.js";

export interface OrderIdArgs {
  orderId: string;
}

export interface PlaceLimitOrderArgs {
  ticker: string;
  quantity: number;
  limitPrice: number;
  timeValidity?: TimeValidity;
}

export interface PlaceMarketOrderArgs {
  ticker: string;
  quantity: number;
  extendedHours?: boolean;
}

export interface PlaceStopOrderArgs {
  ticker: string;
  quantity: number;
  stopPrice: number;
  timeValidity?: TimeValidity;
}

export interface PlaceStopLimitOrderArgs {
  ticker: string;
  quantity: number;
  stopPrice: number;
  limitPrice: number;
  timeValidity?: TimeValidity;
}

const TIME_VALIDITY_SCHEMA = {
  type: "string",
  enum: ["DAY", "GOOD_TILL_CANCEL"],
  description: "Order validity",
} as const;

export const ordersTools: Tool[] = [
  {
    name: "fetch_all_orders",
    description: "Fetch all pending equity orders",
    inputSchema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: [
            "LOCAL",
            "UNCONFIRMED",
            "CONFIRMED",
            "NEW",
            "CANCELLING",
            "CANCELLED",
            "PARTIALLY_FILLED",
            "FILLED",
            "REJECTED",
            "REPLACING",
            "REPLACED",
          ],
          description: "Optional order status filter",
        },
        limit: {
          type: "number",
          description: "Optional maximum number of orders to return",
        },
      },
      required: [],
    },
  },
  {
    name: "fetch_order",
    description: "Fetch a specific order by ID",
    inputSchema: {
      type: "object",
      properties: {
        orderId: { type: "string", description: "Order ID" },
      },
      required: ["orderId"],
    },
  },
  {
    name: "place_limit_order",
    description:
      "Place a limit order. Use positive quantity for buy and negative quantity for sell.",
    inputSchema: {
      type: "object",
      properties: {
        ticker: { type: "string", description: "Ticker symbol" },
        quantity: {
          type: "number",
          description: "Order quantity (positive = buy, negative = sell)",
        },
        limitPrice: { type: "number", description: "Limit price" },
        timeValidity: TIME_VALIDITY_SCHEMA,
      },
      required: ["ticker", "quantity", "limitPrice"],
    },
  },
  {
    name: "place_market_order",
    description:
      "Place a market order. Use positive quantity for buy and negative quantity for sell.",
    inputSchema: {
      type: "object",
      properties: {
        ticker: { type: "string", description: "Ticker symbol" },
        quantity: {
          type: "number",
          description: "Order quantity (positive = buy, negative = sell)",
        },
        extendedHours: {
          type: "boolean",
          description: "Allow execution outside regular trading hours",
        },
      },
      required: ["ticker", "quantity"],
    },
  },
  {
    name: "place_stop_order",
    description:
      "Place a stop order. Use positive quantity for buy and negative quantity for sell.",
    inputSchema: {
      type: "object",
      properties: {
        ticker: { type: "string", description: "Ticker symbol" },
        quantity: {
          type: "number",
          description: "Order quantity (positive = buy, negative = sell)",
        },
        stopPrice: { type: "number", description: "Stop price" },
        timeValidity: TIME_VALIDITY_SCHEMA,
      },
      required: ["ticker", "quantity", "stopPrice"],
    },
  },
  {
    name: "place_stop_limit_order",
    description:
      "Place a stop-limit order. Use positive quantity for buy and negative quantity for sell.",
    inputSchema: {
      type: "object",
      properties: {
        ticker: { type: "string", description: "Ticker symbol" },
        quantity: {
          type: "number",
          description: "Order quantity (positive = buy, negative = sell)",
        },
        stopPrice: { type: "number", description: "Stop price" },
        limitPrice: { type: "number", description: "Limit price" },
        timeValidity: TIME_VALIDITY_SCHEMA,
      },
      required: ["ticker", "quantity", "stopPrice", "limitPrice"],
    },
  },
  {
    name: "cancel_order",
    description: "Cancel an existing order by ID",
    inputSchema: {
      type: "object",
      properties: {
        orderId: { type: "string", description: "Order ID to cancel" },
      },
      required: ["orderId"],
    },
  },
];

export async function handleFetchAllOrders(
  client: OrdersClient,
  params: ListOrdersParams = {},
): Promise<string> {
  const orders = await client.fetchAllOrders(params);
  return JSON.stringify(orders, null, 2);
}

export async function handleFetchOrder(
  client: OrdersClient,
  orderId: string,
): Promise<string> {
  const order = await client.fetchOrder(orderId);
  return JSON.stringify(order, null, 2);
}

export async function handlePlaceLimitOrder(
  client: OrdersClient,
  params: PlaceLimitOrderArgs,
): Promise<string> {
  const order = await client.placeLimitOrder(
    params.ticker,
    params.quantity,
    params.limitPrice,
    params.timeValidity,
  );
  return JSON.stringify(order, null, 2);
}

export async function handlePlaceMarketOrder(
  client: OrdersClient,
  params: PlaceMarketOrderArgs,
): Promise<string> {
  const order = await client.placeMarketOrder(
    params.ticker,
    params.quantity,
    params.extendedHours,
  );
  return JSON.stringify(order, null, 2);
}

export async function handlePlaceStopOrder(
  client: OrdersClient,
  params: PlaceStopOrderArgs,
): Promise<string> {
  const order = await client.placeStopOrder(
    params.ticker,
    params.quantity,
    params.stopPrice,
    params.timeValidity,
  );
  return JSON.stringify(order, null, 2);
}

export async function handlePlaceStopLimitOrder(
  client: OrdersClient,
  params: PlaceStopLimitOrderArgs,
): Promise<string> {
  const order = await client.placeStopLimitOrder(
    params.ticker,
    params.quantity,
    params.stopPrice,
    params.limitPrice,
    params.timeValidity,
  );
  return JSON.stringify(order, null, 2);
}

export async function handleCancelOrder(
  client: OrdersClient,
  orderId: string,
): Promise<string> {
  await client.cancelOrder(orderId);
  return JSON.stringify({ success: true, message: "Order cancelled" }, null, 2);
}
