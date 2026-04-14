/**
 * Orders Feature Client
 */

import { BaseClient } from "@/api/BaseClient.js";
import { Order, ListOrdersParams } from "./types.js";

export class OrdersClient extends BaseClient {
  /**
   * Fetch all equity orders
   */
  async fetchAllOrders(params: ListOrdersParams = {}): Promise<Order[]> {
    const query = this.buildQueryString({
      status: params.status,
      limit: params.limit,
    });
    return this.request(`/equity/orders${query}`);
  }

  /**
   * Fetch a specific order by ID
   */
  async fetchOrder(orderId: string): Promise<Order> {
    return this.request(`/equity/orders/${orderId}`);
  }

  /**
   * Place a limit order
   */
  async placeLimitOrder(
    ticker: string,
    quantity: number,
    limitPrice: number,
    timeValidity?: "DAY" | "GOOD_TILL_CANCEL",
  ): Promise<Order> {
    return this.request("/equity/orders/limit", {
      method: "POST",
      body: JSON.stringify({
        ticker,
        quantity,
        limitPrice,
        timeValidity,
      }),
    });
  }

  /**
   * Place a market order
   */
  async placeMarketOrder(
    ticker: string,
    quantity: number,
    extendedHours?: boolean,
  ): Promise<Order> {
    return this.request("/equity/orders/market", {
      method: "POST",
      body: JSON.stringify({
        ticker,
        quantity,
        extendedHours,
      }),
    });
  }

  /**
   * Place a stop order
   */
  async placeStopOrder(
    ticker: string,
    quantity: number,
    stopPrice: number,
    timeValidity?: "DAY" | "GOOD_TILL_CANCEL",
  ): Promise<Order> {
    return this.request("/equity/orders/stop", {
      method: "POST",
      body: JSON.stringify({
        ticker,
        quantity,
        stopPrice,
        timeValidity,
      }),
    });
  }

  /**
   * Place a stop-limit order
   */
  async placeStopLimitOrder(
    ticker: string,
    quantity: number,
    stopPrice: number,
    limitPrice: number,
    timeValidity?: "DAY" | "GOOD_TILL_CANCEL",
  ): Promise<Order> {
    return this.request("/equity/orders/stop_limit", {
      method: "POST",
      body: JSON.stringify({
        ticker,
        quantity,
        stopPrice,
        limitPrice,
        timeValidity,
      }),
    });
  }

  /**
   * Cancel an existing order by ID
   */
  async cancelOrder(orderId: string): Promise<void> {
    await this.request(`/equity/orders/${orderId}`, {
      method: "DELETE",
    });
  }
}
