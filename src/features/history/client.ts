/**
 * History Feature Client
 */

import { BaseClient } from "@/api/BaseClient.js";
import {
  HistoricalOrder,
  Dividend,
  Transaction,
  ExportCSV,
  PaginationParams,
  CursorListResponse,
  ExportRequestParams,
} from "./types.js";

export class HistoryClient extends BaseClient {
  /**
   * Fetch historical order data with pagination
   */
  async fetchHistoricalOrderData(
    params: PaginationParams = {},
  ): Promise<CursorListResponse<HistoricalOrder>> {
    const query = this.buildQueryString({
      limit: params.limit,
      cursor: params.cursor,
      ticker: params.ticker,
    });
    return this.request(`/equity/history/orders${query}`);
  }

  /**
   * Fetch paid out dividends with pagination
   */
  async fetchPaidOutDividends(
    params: PaginationParams = {},
  ): Promise<CursorListResponse<Dividend>> {
    const query = this.buildQueryString({
      limit: params.limit,
      cursor: params.cursor,
      ticker: params.ticker,
    });
    return this.request(`/equity/history/dividends${query}`);
  }

  /**
   * Fetch transaction list with pagination
   */
  async fetchTransactionList(
    params: PaginationParams = {},
  ): Promise<CursorListResponse<Transaction>> {
    const query = this.buildQueryString({
      limit: params.limit,
      cursor: params.cursor,
      time: params.time,
    });
    return this.request(`/equity/history/transactions${query}`);
  }

  /**
   * List detailed information about all CSV account exports
   */
  async fetchExportsList(): Promise<ExportCSV[]> {
    return this.request("/equity/history/exports");
  }

  /**
   * Request a CSV export of account's orders, dividends and transactions history
   */
  async requestExportCSV(
    params: ExportRequestParams = {},
  ): Promise<{ reportId: number }> {
    return this.request("/equity/history/exports", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }
}
