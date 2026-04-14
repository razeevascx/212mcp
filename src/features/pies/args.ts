import { z } from "zod";
import type { CreatePieRequest } from "./types.js";
import type { DuplicatePieArgs, UpdatePieArgs } from "./tools.js";
import { ValidationError } from "@/utils/errors.js";

const numberRecordSchema = z.record(z.number());

const createPieSchema = z
  .object({
    name: z.string().trim().min(1, "name is required"),
    icon: z.string().optional(),
    goal: z.number().optional(),
    endDate: z.string().optional(),
    dividendCashAction: z.enum(["REINVEST", "TO_ACCOUNT_CASH"]).optional(),
    instrumentShares: numberRecordSchema.optional(),
  })
  .passthrough();

const fetchPieSchema = z
  .object({
    pieId: z.string().trim().min(1, "pieId is required"),
  })
  .passthrough();

const updatePieSchema = z
  .object({
    pieId: z.string().trim().min(1, "pieId is required"),
    name: z.string().optional(),
    icon: z.string().optional(),
    goal: z.number().optional(),
    endDate: z.string().optional(),
    dividendCashAction: z.enum(["REINVEST", "TO_ACCOUNT_CASH"]).optional(),
    instrumentShares: numberRecordSchema.optional(),
  })
  .passthrough();

const duplicatePieSchema = z
  .object({
    pieId: z.string().trim().min(1, "pieId is required"),
    name: z.string().trim().min(1, "name is required"),
    icon: z.string().optional(),
  })
  .passthrough();

function toValidationError(error: unknown): ValidationError {
  if (error instanceof z.ZodError) {
    return new ValidationError(error.issues.map((i) => i.message).join("; "));
  }
  return new ValidationError(String(error));
}

export function parseCreatePieArgs(args: unknown): CreatePieRequest {
  try {
    return createPieSchema.parse(args ?? {});
  } catch (error) {
    throw toValidationError(error);
  }
}

export function parsePieIdArg(args: unknown): string {
  try {
    return fetchPieSchema.parse(args ?? {}).pieId;
  } catch (error) {
    throw toValidationError(error);
  }
}

export function parseUpdatePieArgs(args: unknown): UpdatePieArgs {
  try {
    return updatePieSchema.parse(args ?? {});
  } catch (error) {
    throw toValidationError(error);
  }
}

export function parseDuplicatePieArgs(args: unknown): DuplicatePieArgs {
  try {
    return duplicatePieSchema.parse(args ?? {});
  } catch (error) {
    throw toValidationError(error);
  }
}
