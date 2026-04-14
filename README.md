<div align="center">

# Trading 212 MCP Server

_Secure Trading 212 Public API access for Claude via MCP_

<img height="30" src="https://img.shields.io/badge/MCP-Server-4f46e5?style=flat-square" alt="MCP Server" />
<img height="30" src="https://img.shields.io/badge/TypeScript-Strict-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
<img height="30" src="https://img.shields.io/badge/Bun-1.x-000000?style=flat-square&logo=bun&logoColor=white" alt="Bun" />
<img height="30" src="https://img.shields.io/badge/Trading%20212-Public%20API-059669?style=flat-square" alt="Trading 212 API" />

**Built with:**

<img height="36" src="https://img.shields.io/badge/-TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
<img height="36" src="https://img.shields.io/badge/-Bun-000000?style=flat-square&logo=bun&logoColor=white" alt="Bun" />
<img height="36" src="https://img.shields.io/badge/-Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js" />
<img height="36" src="https://img.shields.io/badge/-MCP%20SDK-111827?style=flat-square" alt="MCP SDK" />
<img height="36" src="https://img.shields.io/badge/-Zod-3b82f6?style=flat-square" alt="Zod" />

</div>

## Project Overview

This project exposes Trading 212 Public API capabilities as MCP tools so Claude Desktop can securely query account, market, order, history, and pie data. It targets users who want natural-language access to their portfolio workflows without building a custom UI. The main value is a modular feature-based TypeScript architecture with structured errors, strict environment handling, and tool-first MCP integration.

## Key Features

- **Claude-Ready MCP Tools** - Use Trading 212 operations directly from Claude Desktop through MCP.
- **Public API-Compatible Auth** - Supports Trading 212 Basic auth with API key + API secret.
- **Complete Pies Coverage** - Includes list, fetch by id, create, update, duplicate, and delete pie operations.
- **Order Workflows Included** - Pending orders, order details, place/cancel limit, market, stop, and stop-limit orders.
- **History + Export Operations** - Cursor-based historical orders, dividends, transactions, and CSV export request/list endpoints.
- **Typed Error Model** - Consistent authentication, validation, rate-limit, not-found, and API error handling.

## Quick Start Demo

Run locally, then inspect tools using MCP Inspector:

```bash
npx @modelcontextprotocol/inspector
```

For stdio mode, configure Inspector command as:

```bash
bun run src/server.ts
```

## Tech Stack

- **Language:** TypeScript (strict mode)
- **Runtime:** Bun 1.x (Node.js 18+ compatible)
- **MCP:** `@modelcontextprotocol/sdk`
- **Validation/Schema:** `zod`
- **Config:** `dotenv`
- **Testing:** Bun test runner (`bun test src`)

## Installation & Setup

### Prerequisites

- Bun 1.0+
- Node.js 18+
- Trading 212 Public API credentials (`TRADING212_API_KEY`, `TRADING212_API_SECRET`)
- Claude Desktop (for MCP integration)

### Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/razeevascx/212mcp.git
   ```

2. **Navigate to Project**

   ```bash
   cd 212mcp
   ```

3. **Install Dependencies**

   ```bash
   bun install
   ```

4. **Configure Environment**

   ```bash
   cp .env.example .env
   ```

5. **Set Credentials in `.env`**

   ```env
   TRADING212_API_KEY=your_api_key_here
   TRADING212_API_SECRET=your_api_secret_here
   ENVIRONMENT=live
   TRANSPORT=stdio
   LOG_LEVEL=info
   DEBUG=false
   ```

6. **Build Project**

   ```bash
   bun run build
   ```

7. **Start Server**
   ```bash
   bun run start
   ```

### Verification

- You should see `Trading 212 MCP Server running` in terminal output.
- In Claude Desktop, open MCP tools and confirm Trading 212 tools are listed.

## Claude Desktop Configuration

Use this MCP server config:

```json
{
  "mcpServers": {
    "trading212": {
      "command": "bun",
      "args": ["run", "src/server.ts"],
      "env": {
        "TRADING212_API_KEY": "your_api_key_here",
        "TRADING212_API_SECRET": "your_api_secret_here"
      }
    }
  }
}
```

## MCP Tools

### Accounts

- `fetch_account_cash`
- `fetch_account_metadata`

### Instruments

- `search_exchange`
- `search_instrument`

### Portfolio / Positions

- `fetch_open_positions`
- `search_specific_position_by_ticker`
- `fetch_open_position_by_ticker`

### Orders

- `fetch_all_orders`
- `fetch_order`
- `place_limit_order`
- `place_market_order`
- `place_stop_order`
- `place_stop_limit_order`
- `cancel_order`

### History

- `fetch_historical_order_data`
- `fetch_paid_out_dividends`
- `fetch_transaction_list`
- `fetch_exports_list`
- `request_export_csv`

### Pies

- `fetch_pies`
- `fetch_pie`
- `create_pie`
- `update_pie`
- `duplicate_pie`
- `delete_pie`

### Server Utility

- `get_server_health`

## API Usage Notes

- **Authentication:** Trading 212 Public API uses Basic auth (`API_KEY:API_SECRET`), handled by `BaseClient`.
- **Environment Routing:** `ENVIRONMENT=demo|live` maps to Trading 212 demo/live base URLs.
- **Pagination:** History endpoints use `limit` + `cursor` and return `nextPagePath`.
- **Rate Limits:** The API is rate-limited; `429` is surfaced as `RATE_LIMIT_EXCEEDED`.

## Development

### Scripts

- `bun run build` — Compile TypeScript
- `bun run start` — Start MCP server
- `bun run dev` — Watch mode
- `bun test src` — Run tests in `src`

### Troubleshooting

- **Credentials missing:** set `TRADING212_API_KEY` and `TRADING212_API_SECRET`.
- **Auth errors:** regenerate API credentials and restart server.
- **Claude cannot connect:** verify Bun install, command path, and Claude MCP config.
