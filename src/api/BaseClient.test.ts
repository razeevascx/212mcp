import { describe, expect, test, beforeEach, afterEach, mock } from "bun:test";
import { BaseClient } from "./BaseClient.js";
import {
  APIError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
} from "@/utils/errors.js";

class TestClient extends BaseClient {
  public get(path: string) {
    return this.request<unknown>(path);
  }

  public query(params: object) {
    return this.buildQueryString(params);
  }
}

describe("BaseClient", () => {
  const originalEnv = { ...process.env };
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.ENVIRONMENT = "live";
    process.env.TRADING212_API_KEY = "test-key";
    process.env.TRADING212_API_SECRET = "test-secret";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    globalThis.fetch = originalFetch;
    mock.restore();
  });

  test("builds Basic auth header from API key and secret", async () => {
    process.env.TRADING212_API_KEY = "key123";
    process.env.TRADING212_API_SECRET = "secret456";

    globalThis.fetch = mock(async (_url, init) => {
      expect((init?.headers as Record<string, string>)?.Authorization).toMatch(
        /^Basic\s+/,
      );
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }) as unknown as typeof fetch;

    const client = new TestClient();
    await client.get("/ping");
  });

  test("accepts legacy token alias fallback", async () => {
    delete process.env.TRADING212_API_KEY;
    delete process.env.TRADING212_API_SECRET;
    process.env.TRADING212_API_TOKEN = "alias-token";

    globalThis.fetch = mock(async (_url, init) => {
      expect((init?.headers as Record<string, string>)?.Authorization).toBe(
        "Bearer alias-token",
      );
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }) as unknown as typeof fetch;

    const client = new TestClient();
    await client.get("/ping");
  });

  test("throws AuthenticationError when no credentials are set", () => {
    delete process.env.TRADING212_API_KEY;
    delete process.env.TRADING212_API_SECRET;
    delete process.env.TRADING212_API_TOKEN;

    expect(() => new TestClient()).toThrow(AuthenticationError);
  });

  test("uses demo base URL when ENVIRONMENT=demo", async () => {
    process.env.ENVIRONMENT = "demo";

    globalThis.fetch = mock(async (url) => {
      expect(String(url)).toContain("https://demo.trading212.com/api/v0");
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }) as unknown as typeof fetch;

    const client = new TestClient();
    await client.get("/ping");
  });

  test("handles 400 response with non-json body as ValidationError", async () => {
    globalThis.fetch = mock(
      async () => new Response("bad request", { status: 400 }),
    ) as unknown as typeof fetch;

    const client = new TestClient();
    await expect(client.get("/bad-request")).rejects.toThrow(ValidationError);
  });

  test("handles 429 response and parses Retry-After header", async () => {
    globalThis.fetch = mock(async () =>
      new Response("", {
        status: 429,
        headers: { "Retry-After": "120" },
      }),
    ) as unknown as typeof fetch;

    const client = new TestClient();

    try {
      await client.get("/rate-limit");
      throw new Error("Expected RateLimitError");
    } catch (error) {
      expect(error).toBeInstanceOf(RateLimitError);
      expect((error as RateLimitError).retryAfter).toBe(120);
    }
  });

  test("buildQueryString omits nullish values", () => {
    const client = new TestClient();
    const query = client.query({
      limit: 10,
      offset: 0,
      search: undefined,
      status: null,
    });

    expect(query).toBe("?limit=10&offset=0");
  });

  test("wraps network failures as APIError", async () => {
    globalThis.fetch = mock(async () => {
      throw new Error("socket hang up");
    }) as unknown as typeof fetch;

    const client = new TestClient();
    await expect(client.get("/network")).rejects.toThrow(APIError);
  });
});
