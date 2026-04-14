/**
 * Orders Feature Types
 */

export type OrderStatus =
  | "LOCAL"
  | "UNCONFIRMED"
  | "CONFIRMED"
  | "NEW"
  | "CANCELLING"
  | "CANCELLED"
  | "PARTIALLY_FILLED"
  | "FILLED"
  | "REJECTED"
  | "REPLACING"
  | "REPLACED";
export type OrderType = "LIMIT" | "STOP" | "MARKET" | "STOP_LIMIT";
export type OrderSide = "BUY" | "SELL";
export type TimeValidity = "DAY" | "GOOD_TILL_CANCEL";
export type InitiatedFrom =
  | "API"
  | "IOS"
  | "ANDROID"
  | "WEB"
  | "SYSTEM"
  | "AUTOINVEST";

export interface Order {
  id: number;
  ticker: string;
  instrument: {
    ticker: string;
    name: string;
    isin: string;
    currency: string;
  };
  status: OrderStatus;
  side: OrderSide;
  type: OrderType;
  initiatedFrom?: InitiatedFrom;
  strategy?: "QUANTITY" | "VALUE";
  quantity: number;
  value?: number;
  filledQuantity: number;
  limitPrice?: number;
  stopPrice?: number;
  createdAt: string;
  currency?: string;
  timeInForce?: TimeValidity;
  extendedHours?: boolean;
  filledValue?: number;
}

export interface OrderRequest {
  ticker: string;
  quantity: number;
  limitPrice?: number;
  stopPrice?: number;
  timeValidity?: TimeValidity;
  extendedHours?: boolean;
}

export interface ListOrdersParams {
  status?: OrderStatus;
  limit?: number;
}
