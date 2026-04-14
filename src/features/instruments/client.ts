/**
 * Instruments Feature Client
 */

import { BaseClient } from "@/api/BaseClient.js";
import { Exchange, Instrument, SearchInstrumentsParams } from "./types.js";

export class InstrumentsClient extends BaseClient {
  /**
   * Search exchanges
   */
  async searchExchanges(name?: string, id?: string): Promise<Exchange[]> {
    const exchanges = await this.request<Exchange[]>(
      "/equity/metadata/exchanges",
    );

    return exchanges.filter((exchange) => {
      const byName =
        name === undefined ||
        exchange.name.toLowerCase().includes(name.toLowerCase());
      const byId = id === undefined || String(exchange.id) === String(id);
      return byName && byId;
    });
  }

  /**
   * Search instruments
   */
  async searchInstruments(
    params: SearchInstrumentsParams = {},
  ): Promise<Instrument[]> {
    const instruments = await this.request<Instrument[]>(
      "/equity/metadata/instruments",
    );

    return instruments
      .filter((instrument) => {
        const bySearch =
          params.search === undefined
            ? true
            : [
                instrument.ticker,
                instrument.name,
                instrument.isin,
                instrument.shortName,
              ]
                .filter((value): value is string => Boolean(value))
                .some((value) =>
                  value.toLowerCase().includes(params.search!.toLowerCase()),
                );
        const byType = params.type === undefined || instrument.type === params.type;
        const byMarket =
          params.market === undefined ||
          String(instrument.workingScheduleId) === params.market;
        return bySearch && byType && byMarket;
      })
      .slice(params.offset ?? 0, (params.offset ?? 0) + (params.limit ?? 50));
  }
}
