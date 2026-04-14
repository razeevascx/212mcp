/**
 * History Feature Types
 */

export interface HistoricalOrder {
  order: Record<string, unknown>;
  fill?: Record<string, unknown>;
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
