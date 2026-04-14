/**
 * Portfolio Feature Client
 */

import { BaseClient } from "@/api/BaseClient.js";
import { OpenPosition, PortfolioOverview } from "./types.js";

export class PortfolioClient extends BaseClient {
  /**
   * Fetch all open positions
   */
  async fetchOpenPositions(ticker?: string): Promise<OpenPosition[]> {
    const query = this.buildQueryString({ ticker });
    return this.request(`/equity/positions${query}`);
  }

  /**
   * Search for a position by ticker
   */
  async searchSpecificPositionByTicker(ticker: string): Promise<OpenPosition[]> {
    return this.fetchOpenPositions(ticker);
  }

  /**
   * Fetch a position by ticker
   */
  async fetchOpenPositionByTicker(ticker: string): Promise<OpenPosition> {
    const positions = await this.fetchOpenPositions(ticker);
    if (positions.length === 0) {
      throw new Error(`No open position found for ticker: ${ticker}`);
    }
    return positions[0];
  }

  /**
   * Get portfolio overview with analysis
   */
  async getPortfolioOverview(): Promise<PortfolioOverview> {
    const holdings = await this.fetchOpenPositions();
    const totalValue = holdings.reduce(
      (sum, item) => sum + item.walletImpact.currentValue,
      0,
    );
    const totalPl = holdings.reduce(
      (sum, item) => sum + item.walletImpact.unrealizedProfitLoss,
      0,
    );

    return {
      summary: {
        totalValue,
        totalPl,
        averagePlPercentage:
          totalValue > 0 ? (totalPl / totalValue) * 100 : 0,
        holdingsCount: holdings.length,
      },
      holdings,
      allocation: holdings
        .slice()
        .sort(
          (a: OpenPosition, b: OpenPosition) =>
            b.walletImpact.currentValue - a.walletImpact.currentValue,
        )
        .map((item) => ({
          ticker: item.instrument.ticker,
          value: item.walletImpact.currentValue,
          percentage:
            totalValue > 0 ? (item.walletImpact.currentValue / totalValue) * 100 : 0,
          pl: item.walletImpact.unrealizedProfitLoss,
        })),
    };
  }
}
