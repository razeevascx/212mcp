/**
 * Accounts Feature Types
 */

export interface AccountMetadata {
  id: number;
  currency: string;
  totalValue: number;
  investments: {
    totalCost: number;
    currentValue: number;
    unrealizedProfitLoss: number;
    realizedProfitLoss: number;
  };
  cash: AccountCash;
}

export interface AccountCash {
  availableToTrade: number;
  inPies: number;
  reservedForOrders: number;
}
