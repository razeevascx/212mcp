import { describe, expect, test } from "bun:test";
import {
  parseCreatePieArgs,
  parseDuplicatePieArgs,
  parsePieIdArg,
  parseUpdatePieArgs,
} from "./args.js";

describe("pies args parsing", () => {
  test("parseCreatePieArgs requires name", () => {
    expect(() => parseCreatePieArgs({})).toThrow();
    expect(parseCreatePieArgs({ name: "Growth Pie" }).name).toBe("Growth Pie");
  });

  test("parseUpdatePieArgs requires pieId", () => {
    expect(() => parseUpdatePieArgs({ name: "x" })).toThrow();
    expect(parseUpdatePieArgs({ pieId: "123", name: "x" }).pieId).toBe("123");
  });

  test("parseDuplicatePieArgs requires pieId and name", () => {
    expect(() => parseDuplicatePieArgs({ pieId: "1" })).toThrow();
    const parsed = parseDuplicatePieArgs({ pieId: "1", name: "Copy" });
    expect(parsed).toEqual({ pieId: "1", name: "Copy" });
  });

  test("parsePieIdArg extracts pieId", () => {
    expect(parsePieIdArg({ pieId: "10" })).toBe("10");
  });
});
