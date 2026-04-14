/**
 * Portfolio Feature Types
 */

export interface OpenPosition {
  createdAt: string;
  ticker: string;
  instrument: {
    ticker: string;
    name: string;
    isin: string;
    currency: string;
  };
  quantity: number;
  quantityAvailableForTrading: number;
  quantityInPies: number;
  averagePricePaid: number;
  currentPrice: number;
  walletImpact: {
    currency: string;
    totalCost: number;
    currentValue: number;
    unrealizedProfitLoss: number;
    fxImpact: number;
  };
}

export interface PortfolioOverview {
  summary: {
    totalValue: number;
    totalPl: number;
    averagePlPercentage: number;
    holdingsCount: number;
  };
  holdings: OpenPosition[];
  allocation: Array<{
    ticker: string;
    value: number;
    percentage: number;
    pl: number;
  }>;
}
