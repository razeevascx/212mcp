import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import {
  generateBasicAuthHeader,
  resolveAuthHeader,
  validateAuthCredentials,
} from "./auth";
import { ValidationError } from "./errors";

describe("Auth Utilities", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("generateBasicAuthHeader", () => {
    it("should generate correct Basic auth header from API key and secret", () => {
      const result = generateBasicAuthHeader("testkey", "testsecret");
      const expectedEncoded = Buffer.from(
        "testkey:testsecret",
        "utf8",
      ).toString("base64");
      expect(result).toBe(`Basic ${expectedEncoded}`);
    });

    it("should handle special characters in credentials", () => {
      const result = generateBasicAuthHeader("key@123", "secret!@#$");
      const expectedEncoded = Buffer.from(
        "key@123:secret!@#$",
        "utf8",
      ).toString("base64");
      expect(result).toBe(`Basic ${expectedEncoded}`);
    });

    it("should throw error if API key is missing", () => {
      expect(() => generateBasicAuthHeader("", "secret")).toThrow(
        ValidationError,
      );
    });

    it("should throw error if API secret is missing", () => {
      expect(() => generateBasicAuthHeader("key", "")).toThrow(ValidationError);
    });
  });

  describe("resolveAuthHeader", () => {
    it("should use explicit header if provided", () => {
      process.env.TRADING212_AUTH_HEADER = "Bearer explicit-token";
      process.env.TRADING212_API_KEY = "ignored-key";
      process.env.TRADING212_API_SECRET = "ignored-secret";

      const result = resolveAuthHeader();
      expect(result).toBe("Bearer explicit-token");
    });

    it("should use API key + secret if no explicit header", () => {
      delete process.env.TRADING212_AUTH_HEADER;
      process.env.TRADING212_API_KEY = "mykey";
      process.env.TRADING212_API_SECRET = "mysecret";

      const result = resolveAuthHeader();
      const expectedEncoded = Buffer.from("mykey:mysecret", "utf8").toString(
        "base64",
      );
      expect(result).toBe(`Basic ${expectedEncoded}`);
    });

    it("should use legacy token as fallback", () => {
      delete process.env.TRADING212_AUTH_HEADER;
      delete process.env.TRADING212_API_KEY;
      delete process.env.TRADING212_API_SECRET;
      process.env.TRADING212_API_TOKEN = "legacy-token";

      const result = resolveAuthHeader();
      expect(result).toBe("Bearer legacy-token");
    });

    it("should prioritize apiToken parameter over env legacy token", () => {
      delete process.env.TRADING212_AUTH_HEADER;
      delete process.env.TRADING212_API_KEY;
      delete process.env.TRADING212_API_SECRET;
      process.env.TRADING212_API_TOKEN = "env-token";

      const result = resolveAuthHeader("param-token");
      expect(result).toBe("Bearer param-token");
    });

    it("should throw error if no credentials provided", () => {
      delete process.env.TRADING212_AUTH_HEADER;
      delete process.env.TRADING212_API_KEY;
      delete process.env.TRADING212_API_SECRET;
      delete process.env.TRADING212_API_TOKEN;

      expect(() => resolveAuthHeader()).toThrow(ValidationError);
    });
  });

  describe("validateAuthCredentials", () => {
    it("should pass if explicit header is set", () => {
      process.env.TRADING212_AUTH_HEADER = "Bearer token";
      expect(() => validateAuthCredentials()).not.toThrow();
    });

    it("should pass if both API key and secret are set", () => {
      process.env.TRADING212_API_KEY = "key";
      process.env.TRADING212_API_SECRET = "secret";
      expect(() => validateAuthCredentials()).not.toThrow();
    });

    it("should pass if legacy token is set", () => {
      process.env.TRADING212_API_TOKEN = "token";
      expect(() => validateAuthCredentials()).not.toThrow();
    });

    it("should throw if no credentials are set", () => {
      delete process.env.TRADING212_AUTH_HEADER;
      delete process.env.TRADING212_API_KEY;
      delete process.env.TRADING212_API_SECRET;
      delete process.env.TRADING212_API_TOKEN;

      expect(() => validateAuthCredentials()).toThrow(ValidationError);
    });

    it("should throw if only API key is set without secret", () => {
      process.env.TRADING212_API_KEY = "key";
      delete process.env.TRADING212_API_SECRET;

      expect(() => validateAuthCredentials()).toThrow(ValidationError);
    });

    it("should throw if only API secret is set without key", () => {
      delete process.env.TRADING212_API_KEY;
      process.env.TRADING212_API_SECRET = "secret";

      expect(() => validateAuthCredentials()).toThrow(ValidationError);
    });
  });
});
