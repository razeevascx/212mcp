import { z } from "zod";
import type { ExportRequestParams, PaginationParams } from "./types.js";
import { ValidationError } from "@/utils/errors.js";

const paginationSchema = z
  .object({
    limit: z.number().optional(),
    cursor: z.union([z.string(), z.number()]).optional(),
    ticker: z.string().optional(),
    time: z.string().optional(),
  })
  .passthrough();

const exportRequestSchema = z
  .object({
    timeFrom: z.string().optional(),
    timeTo: z.string().optional(),
    dataIncluded: z
      .object({
        includeOrders: z.boolean().optional(),
        includeDividends: z.boolean().optional(),
        includeTransactions: z.boolean().optional(),
        includeInterest: z.boolean().optional(),
      })
      .optional(),
  })
  .passthrough();

function toValidationError(error: unknown): ValidationError {
  if (error instanceof z.ZodError) {
    return new ValidationError(error.issues.map((i) => i.message).join("; "));
  }
  return new ValidationError(String(error));
}

export function parsePaginationArgs(args: unknown): PaginationParams {
  try {
    const parsed = paginationSchema.parse(args ?? {});
    return {
      limit: parsed.limit,
      cursor: parsed.cursor,
      ticker: parsed.ticker,
      time: parsed.time,
    };
  } catch (error) {
    throw toValidationError(error);
  }
}

export function parseExportRequestArgs(args: unknown): ExportRequestParams {
  try {
    const parsed = exportRequestSchema.parse(args ?? {});
    return {
      timeFrom: parsed.timeFrom,
      timeTo: parsed.timeTo,
      dataIncluded: parsed.dataIncluded,
    };
  } catch (error) {
    throw toValidationError(error);
  }
}
