/**
 * Pies Feature Tools
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { PiesClient } from "./client.js";
import {
  CreatePieRequest,
  DuplicatePieRequest,
  UpdatePieRequest,
} from "./types.js";

export interface PieIdArgs {
  pieId: string;
}

export interface UpdatePieArgs extends UpdatePieRequest {
  pieId: string;
}

export interface DuplicatePieArgs extends DuplicatePieRequest {
  pieId: string;
}

export const piesTools: Tool[] = [
  {
    name: "fetch_pies",
    description: "Fetch all pies",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "create_pie",
    description: "Create a new pie",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Pie name" },
        icon: { type: "string", description: "Pie icon (optional)" },
        goal: {
          type: "number",
          description: "Total desired value of the pie in account currency",
        },
        endDate: { type: "string", description: "ISO end date" },
        dividendCashAction: {
          type: "string",
          enum: ["REINVEST", "TO_ACCOUNT_CASH"],
          description: "How to treat dividends",
        },
        instrumentShares: {
          type: "object",
          description: "Map of ticker to target share percentage",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "fetch_pie",
    description: "Fetch a specific pie by ID",
    inputSchema: {
      type: "object",
      properties: {
        pieId: { type: "string", description: "Pie ID" },
      },
      required: ["pieId"],
    },
  },
  {
    name: "update_pie",
    description: "Update a specific pie by ID",
    inputSchema: {
      type: "object",
      properties: {
        pieId: { type: "string", description: "Pie ID" },
        name: { type: "string", description: "New pie name (optional)" },
        icon: { type: "string", description: "New pie icon (optional)" },
        goal: {
          type: "number",
          description: "Total desired value of the pie in account currency",
        },
        endDate: { type: "string", description: "ISO end date" },
        dividendCashAction: {
          type: "string",
          enum: ["REINVEST", "TO_ACCOUNT_CASH"],
          description: "How to treat dividends",
        },
        instrumentShares: {
          type: "object",
          description: "Map of ticker to target share percentage",
        },
      },
      required: ["pieId"],
    },
  },
  {
    name: "delete_pie",
    description: "Delete a pie",
    inputSchema: {
      type: "object",
      properties: {
        pieId: { type: "string", description: "Pie ID" },
      },
      required: ["pieId"],
    },
  },
  {
    name: "duplicate_pie",
    description: "Duplicate a pie with new name/icon",
    inputSchema: {
      type: "object",
      properties: {
        pieId: { type: "string", description: "Pie ID to duplicate" },
        name: { type: "string", description: "Name of duplicated pie" },
        icon: { type: "string", description: "Icon of duplicated pie (optional)" },
      },
      required: ["pieId", "name"],
    },
  },
];

export async function handleFetchPies(client: PiesClient): Promise<string> {
  const pies = await client.fetchPies();
  return JSON.stringify(pies, null, 2);
}

export async function handleCreatePie(
  client: PiesClient,
  params: CreatePieRequest,
): Promise<string> {
  const pie = await client.createPie(params);
  return JSON.stringify(pie, null, 2);
}

export async function handleFetchPie(
  client: PiesClient,
  pieId: string,
): Promise<string> {
  const pie = await client.fetchPieById(pieId);
  return JSON.stringify(pie, null, 2);
}

export async function handleUpdatePie(
  client: PiesClient,
  params: UpdatePieArgs,
): Promise<string> {
  const pie = await client.updatePie(params.pieId, {
    name: params.name,
    icon: params.icon,
    goal: params.goal,
    endDate: params.endDate,
    dividendCashAction: params.dividendCashAction,
    instrumentShares: params.instrumentShares,
  });
  return JSON.stringify(pie, null, 2);
}

export async function handleDeletePie(
  client: PiesClient,
  pieId: string,
): Promise<string> {
  await client.deletePie(pieId);
  return JSON.stringify({ success: true, message: "Pie deleted" }, null, 2);
}

export async function handleDuplicatePie(
  client: PiesClient,
  params: DuplicatePieArgs,
): Promise<string> {
  const pie = await client.duplicatePie(params.pieId, {
    name: params.name,
    icon: params.icon,
  });
  return JSON.stringify(pie, null, 2);
}
