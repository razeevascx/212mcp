/**
 * History Feature Types
 */

import type { Order } from "@/features/orders/types.js";

export interface HistoricalOrder {
  order: Order;
  fill?: HistoricalOrderFill;
}

export interface HistoricalOrderFill {
  id: number;
  quantity: number;
  price: number;
  filledAt: string;
  tradingMethod: "TOTV" | "OTC";
  type:
    | "TRADE"
    | "STOCK_SPLIT"
    | "STOCK_DISTRIBUTION"
    | "FOP"
    | "FOP_CORRECTION"
    | "CUSTOM_STOCK_DISTRIBUTION"
    | "EQUITY_RIGHTS"
    | "SCRIP_STOCK_DIVIDENDS"
    | "STOCK_DIVIDENDS"
    | "STOCK_ACQUISITION"
    | "CASH_AND_STOCK_ACQUISITION"
    | "SPIN_OFF";
  walletImpact: {
    currency: string;
    fxRate?: number;
    netValue?: number;
    realisedProfitLoss?: number;
    taxes?: Array<{
      name:
        | "COMMISSION_TURNOVER"
        | "CURRENCY_CONVERSION_FEE"
        | "FINRA_FEE"
        | "FRENCH_TRANSACTION_TAX"
        | "PTM_LEVY"
        | "STAMP_DUTY"
        | "STAMP_DUTY_RESERVE_TAX"
        | "TRANSACTION_FEE";
      quantity: number;
      currency: string;
      chargedAt?: string;
    }>;
  };
}

export interface Dividend {
  instrument?: {
    ticker: string;
    name: string;
    isin: string;
    currency: string;
  };
  ticker: string;
  paidOn: string;
  quantity: number;
  grossAmountPerShare?: number;
  amount: number;
  currency: string;
  type: string;
  reference: string;
}

export interface Transaction {
  reference: string;
  dateTime: string;
  type: "WITHDRAW" | "DEPOSIT" | "FEE" | "TRANSFER";
  amount: number;
  currency: string;
}

export interface ExportCSV {
  reportId: number;
  status:
    | "Queued"
    | "Processing"
    | "Running"
    | "Canceled"
    | "Failed"
    | "Finished";
  downloadLink?: string;
  timeFrom?: string;
  timeTo?: string;
  dataIncluded?: {
    includeOrders?: boolean;
    includeDividends?: boolean;
    includeTransactions?: boolean;
    includeInterest?: boolean;
  };
}

export interface PaginationParams {
  limit?: number;
  cursor?: string | number;
  ticker?: string;
  time?: string;
}

export interface CursorListResponse<T> {
  items: T[];
  nextPagePath?: string | null;
}

export interface ExportRequestParams {
  timeFrom?: string;
  timeTo?: string;
  dataIncluded?: {
    includeOrders?: boolean;
    includeDividends?: boolean;
    includeTransactions?: boolean;
    includeInterest?: boolean;
  };
}
