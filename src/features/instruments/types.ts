/**
 * Instruments Feature Types
 */

export interface Exchange {
  id: number;
  name: string;
  workingSchedules?: Array<{
    id: number;
    timeEvents: Array<{
      date: string;
      type:
        | "OPEN"
        | "CLOSE"
        | "BREAK_START"
        | "BREAK_END"
        | "PRE_MARKET_OPEN"
        | "AFTER_HOURS_OPEN"
        | "AFTER_HOURS_CLOSE"
        | "OVERNIGHT_OPEN";
    }>;
  }>;
}

export interface Instrument {
  ticker: string;
  type: string;
  name: string;
  isin: string;
  currencyCode: string;
  shortName?: string;
  workingScheduleId?: number;
  addedOn?: string;
  extendedHours?: boolean;
  maxOpenQuantity?: number;
}

export interface SearchInstrumentsParams {
  search?: string;
  type?: string;
  market?: string;
  limit?: number;
  offset?: number;
}
