import { z } from "zod";
import type { SearchExchangeArgs } from "./tools.js";
import type { SearchInstrumentsParams } from "./types.js";
import { ValidationError } from "@/utils/errors.js";

const searchExchangeSchema = z
  .object({
    name: z.string().optional(),
    id: z.string().optional(),
  })
  .passthrough();

const searchInstrumentSchema = z
  .object({
    search: z.string().optional(),
    type: z.string().optional(),
    market: z.string().optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
  })
  .passthrough();

function toValidationError(error: unknown): ValidationError {
  if (error instanceof z.ZodError) {
    return new ValidationError(error.issues.map((i) => i.message).join("; "));
  }
  return new ValidationError(String(error));
}

export function parseSearchExchangeArgs(args: unknown): SearchExchangeArgs {
  try {
    const parsed = searchExchangeSchema.parse(args ?? {});
    return { name: parsed.name, id: parsed.id };
  } catch (error) {
    throw toValidationError(error);
  }
}

export function parseSearchInstrumentArgs(args: unknown): SearchInstrumentsParams {
  try {
    const parsed = searchInstrumentSchema.parse(args ?? {});
    return {
      search: parsed.search,
      type: parsed.type,
      market: parsed.market,
      limit: parsed.limit,
      offset: parsed.offset,
    };
  } catch (error) {
    throw toValidationError(error);
  }
}
