/**
 * Pies Feature Types
 */

export interface Pie {
  id: number;
  cash?: number;
  progress?: number;
  status?: "AHEAD" | "ON_TRACK" | "BEHIND";
  settings?: {
    id: number;
    name: string;
    icon?: string;
    goal?: number;
    endDate?: string;
    creationDate?: string;
    initialInvestment?: number;
    publicUrl?: string;
    dividendCashAction?: "REINVEST" | "TO_ACCOUNT_CASH";
    instrumentShares?: Record<string, number>;
  };
  result?: {
    priceAvgInvestedValue?: number;
    priceAvgResult?: number;
    priceAvgResultCoef?: number;
    priceAvgValue?: number;
  };
  dividendDetails?: {
    gained?: number;
    inCash?: number;
    reinvested?: number;
  };
  instruments?: Array<{
    ticker: string;
    currentShare: number;
    expectedShare: number;
    ownedQuantity?: number;
    result?: {
      priceAvgInvestedValue?: number;
      priceAvgResult?: number;
      priceAvgResultCoef?: number;
      priceAvgValue?: number;
    };
    issues?: Array<{
      name:
        | "DELISTED"
        | "SUSPENDED"
        | "NO_LONGER_TRADABLE"
        | "MAX_POSITION_SIZE_REACHED"
        | "APPROACHING_MAX_POSITION_SIZE"
        | "COMPLEX_INSTRUMENT_APP_TEST_REQUIRED"
        | "PRICE_TOO_LOW";
      severity: "IRREVERSIBLE" | "REVERSIBLE" | "INFORMATIVE";
    }>;
  }>;
}

export interface CreatePieRequest {
  name: string;
  icon?: string;
  goal?: number;
  endDate?: string;
  dividendCashAction?: "REINVEST" | "TO_ACCOUNT_CASH";
  instrumentShares?: Record<string, number>;
}

export interface UpdatePieRequest {
  name?: string;
  icon?: string;
  goal?: number;
  endDate?: string;
  dividendCashAction?: "REINVEST" | "TO_ACCOUNT_CASH";
  instrumentShares?: Record<string, number>;
}

export interface DuplicatePieRequest {
  name: string;
  icon?: string;
}
