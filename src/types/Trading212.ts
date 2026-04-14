/**
 * Trading 212 API Type Definitions
 * Comprehensive TypeScript interfaces for all Trading 212 API endpoints
 */

export interface Account {
  accountId: string;
  accountName: string;
  accountType: "INVEST" | "ISA" | "CFD";
  currency: string;
  canTransfer: boolean;
  cash: number;
  availableCash: number;
  investedAmount: number;
  totalValue: number;
  dayPlAndPercentage: {
    amount: number;
    percentage: number;
  };
  totalPlAndPercentage: {
    amount: number;
    percentage: number;
  };
}

export interface PortfolioItem {
  positionId: string;
  ticker: string;
  instrumentCode: string;
  instrumentName: string;
  quantity: number;
  quantityFractional: number;
  currentPrice: number;
  currentValue: number;
  plAmount: number;
  plPercentage: number;
  averagePrice: number;
  fxPpl: number;
  fxPplPercentage: number;
}

export interface Instrument {
  code: string;
  type: string;
  name: string;
  ticker: string;
  isin: string;
  currencyCode: string;
  description?: string;
  exchange?: string;
  countryCode?: string;
  inceptionDate?: string;
}

export interface Order {
  orderId: string;
  instrumentCode: string;
  ticker: string;
  status:
    | "PENDING"
    | "EXECUTED"
    | "PARTIALLY_FILLED"
    | "CANCELLED"
    | "REJECTED";
  orderType: "BUY" | "SELL";
  quantity: number;
  filledQuantity: number;
  limitPrice?: number;
  stopPrice?: number;
  createdAt: string;
  executedAt?: string;
  totalCost?: number;
  totalFees?: number;
  averageFillPrice?: number;
}

export interface Transaction {
  transactionId: string;
  date: string;
  type:
    | "BUY"
    | "SELL"
    | "DIVIDEND"
    | "INTEREST"
    | "FEE"
    | "DEPOSIT"
    | "WITHDRAWAL"
    | "CORPORATE_ACTION";
  instrumentCode?: string;
  ticker?: string;
  quantity?: number;
  price?: number;
  amount: number;
  currency: string;
  description: string;
  reference?: string;
}

export interface Dividend {
  dividendId: string;
  instrumentCode: string;
  ticker: string;
  paymentDate: string;
  exDividendDate: string;
  quantity: number;
  amountPerShare: number;
  totalAmount: number;
  currency: string;
  status: "PENDING" | "PAID" | "CANCELLED";
}

export interface PerformanceHistory {
  date: string;
  value: number;
  return: number;
  returnPercentage: number;
  dividendsCollected?: number;
  investedAmount?: number;
}

export interface PriceHistory {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  adjusted?: boolean;
}

export interface SearchInstrumentsParams {
  search?: string;
  type?: string;
  market?: string;
  limit?: number;
  offset?: number;
}

export interface ListOrdersParams {
  status?: Order["status"];
  limit?: number;
  offset?: number;
  instrumentCode?: string;
}

export interface ListDividendsParams {
  status?: Dividend["status"];
  limit?: number;
  offset?: number;
  instrumentCode?: string;
}

export interface APIError {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, string>;
}

export interface ListResponse<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}
