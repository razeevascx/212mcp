/**
 * Authentication utilities for Trading 212 API
 */

import { ValidationError } from "./errors.js";

/**
 * Generates a Basic Authentication header from API key and secret
 * @param apiKey - Trading 212 API key
 * @param apiSecret - Trading 212 API secret
 * @returns Basic auth header string (e.g., "Basic base64encodedstring")
 */
export function generateBasicAuthHeader(
  apiKey: string,
  apiSecret: string,
): string {
  if (!apiKey || !apiSecret) {
    throw new ValidationError("API key and secret are required for Basic auth");
  }

  const credentials = `${apiKey}:${apiSecret}`;
  const encoded = Buffer.from(credentials, "utf8").toString("base64");
  return `Basic ${encoded}`;
}

/**
 * Resolves the authentication header from environment variables
 * Priority: explicit header > apiKey+apiSecret > legacy token
 * @param apiToken - Optional legacy API token (fallback)
 * @returns Authorization header string
 * @throws ValidationError if no valid auth credentials are provided
 */
export function resolveAuthHeader(apiToken?: string): string {
  const explicitHeader = process.env.TRADING212_AUTH_HEADER;
  const apiKey = process.env.TRADING212_API_KEY;
  const apiSecret = process.env.TRADING212_API_SECRET;
  const legacyToken = apiToken ?? process.env.TRADING212_API_TOKEN;

  if (explicitHeader) {
    return explicitHeader;
  }

  if (apiKey && apiSecret) {
    return generateBasicAuthHeader(apiKey, apiSecret);
  }

  if (legacyToken) {
    // Legacy compatibility path; official v0 public API expects Basic auth.
    return `Bearer ${legacyToken}`;
  }

  throw new ValidationError(
    "Set TRADING212_API_KEY + TRADING212_API_SECRET (or TRADING212_AUTH_HEADER)",
  );
}

/**
 * Validates that authentication credentials are properly configured
 * @throws ValidationError if credentials are missing or invalid
 */
export function validateAuthCredentials(): void {
  const explicitHeader = process.env.TRADING212_AUTH_HEADER;
  const apiKey = process.env.TRADING212_API_KEY;
  const apiSecret = process.env.TRADING212_API_SECRET;
  const legacyToken = process.env.TRADING212_API_TOKEN;

  if (!explicitHeader && !apiKey && !apiSecret && !legacyToken) {
    throw new ValidationError(
      "No authentication credentials configured. Please set TRADING212_API_KEY + TRADING212_API_SECRET (or TRADING212_AUTH_HEADER or TRADING212_API_TOKEN)",
    );
  }

  if ((apiKey && !apiSecret) || (!apiKey && apiSecret)) {
    throw new ValidationError(
      "Both TRADING212_API_KEY and TRADING212_API_SECRET must be set together",
    );
  }
}
