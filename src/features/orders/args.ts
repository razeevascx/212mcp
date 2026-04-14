import { z } from "zod";
import type {
  ListOrdersParams,
  OrderStatus,
  TimeValidity,
} from "./types.js";
import type {
  PlaceLimitOrderArgs,
  PlaceMarketOrderArgs,
  PlaceStopLimitOrderArgs,
  PlaceStopOrderArgs,
} from "./tools.js";
import { ValidationError } from "@/utils/errors.js";

const orderStatusSchema = z.enum([
  "LOCAL",
  "UNCONFIRMED",
  "CONFIRMED",
  "NEW",
  "CANCELLING",
  "CANCELLED",
  "PARTIALLY_FILLED",
  "FILLED",
  "REJECTED",
  "REPLACING",
  "REPLACED",
]);

const timeValiditySchema = z.enum(["DAY", "GOOD_TILL_CANCEL"]);

const nonZeroNumber = z
  .number()
  .refine((value) => value !== 0, "Quantity must be non-zero");

const listOrdersSchema = z
  .object({
    status: orderStatusSchema.optional(),
    limit: z.number().optional(),
  })
  .passthrough();

const orderIdSchema = z
  .object({
    orderId: z.string().trim().min(1, "orderId is required"),
  })
  .passthrough();

const placeLimitOrderSchema = z
  .object({
    ticker: z.string().trim().min(1, "ticker is required"),
    quantity: nonZeroNumber,
    limitPrice: z.number(),
    timeValidity: timeValiditySchema.optional(),
  })
  .passthrough();

const placeMarketOrderSchema = z
  .object({
    ticker: z.string().trim().min(1, "ticker is required"),
    quantity: nonZeroNumber,
    extendedHours: z.boolean().optional(),
  })
  .passthrough();

const placeStopOrderSchema = z
  .object({
    ticker: z.string().trim().min(1, "ticker is required"),
    quantity: nonZeroNumber,
    stopPrice: z.number(),
    timeValidity: timeValiditySchema.optional(),
  })
  .passthrough();

const placeStopLimitOrderSchema = z
  .object({
    ticker: z.string().trim().min(1, "ticker is required"),
    quantity: nonZeroNumber,
    stopPrice: z.number(),
    limitPrice: z.number(),
    timeValidity: timeValiditySchema.optional(),
  })
  .passthrough();

function toValidationError(error: unknown): ValidationError {
  if (error instanceof z.ZodError) {
    return new ValidationError(error.issues.map((i) => i.message).join("; "));
  }
  return new ValidationError(String(error));
}

export function parseListOrdersArgs(args: unknown): ListOrdersParams {
  try {
    const parsed = listOrdersSchema.parse(args ?? {});
    return {
      status: parsed.status as OrderStatus | undefined,
      limit: parsed.limit,
    };
  } catch (error) {
    throw toValidationError(error);
  }
}

export function parseOrderIdArg(args: unknown): string {
  try {
    return orderIdSchema.parse(args ?? {}).orderId;
  } catch (error) {
    throw toValidationError(error);
  }
}

export function parsePlaceLimitOrderArgs(args: unknown): PlaceLimitOrderArgs {
  try {
    const parsed = placeLimitOrderSchema.parse(args ?? {});
    return {
      ticker: parsed.ticker,
      quantity: parsed.quantity,
      limitPrice: parsed.limitPrice,
      timeValidity: parsed.timeValidity as TimeValidity | undefined,
    };
  } catch (error) {
    throw toValidationError(error);
  }
}

export function parsePlaceMarketOrderArgs(args: unknown): PlaceMarketOrderArgs {
  try {
    return placeMarketOrderSchema.parse(args ?? {});
  } catch (error) {
    throw toValidationError(error);
  }
}

export function parsePlaceStopOrderArgs(args: unknown): PlaceStopOrderArgs {
  try {
    const parsed = placeStopOrderSchema.parse(args ?? {});
    return {
      ticker: parsed.ticker,
      quantity: parsed.quantity,
      stopPrice: parsed.stopPrice,
      timeValidity: parsed.timeValidity as TimeValidity | undefined,
    };
  } catch (error) {
    throw toValidationError(error);
  }
}

export function parsePlaceStopLimitOrderArgs(
  args: unknown,
): PlaceStopLimitOrderArgs {
  try {
    const parsed = placeStopLimitOrderSchema.parse(args ?? {});
    return {
      ticker: parsed.ticker,
      quantity: parsed.quantity,
      stopPrice: parsed.stopPrice,
      limitPrice: parsed.limitPrice,
      timeValidity: parsed.timeValidity as TimeValidity | undefined,
    };
  } catch (error) {
    throw toValidationError(error);
  }
}
