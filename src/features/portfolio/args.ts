import { z } from "zod";
import { ValidationError } from "@/utils/errors.js";

const optionalTickerSchema = z
  .object({
    ticker: z.string().trim().min(1).optional(),
  })
  .passthrough();

function toValidationError(error: unknown): ValidationError {
  if (error instanceof z.ZodError) {
    return new ValidationError(error.issues.map((i) => i.message).join("; "));
  }
  return new ValidationError(String(error));
}

export function parseOptionalTickerArg(args: unknown): string | undefined {
  try {
    return optionalTickerSchema.parse(args ?? {}).ticker;
  } catch (error) {
    throw toValidationError(error);
  }
}
