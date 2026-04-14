/**
 * Pies Feature Client
 */

import { BaseClient } from "@/api/BaseClient.js";
import {
  Pie,
  CreatePieRequest,
  UpdatePieRequest,
  DuplicatePieRequest,
} from "./types.js";

export class PiesClient extends BaseClient {
  /**
   * Create a new pie
   */
  async createPie(request: CreatePieRequest): Promise<Pie> {
    return this.request("/equity/pies", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  /**
   * Update a specific pie by ID
   */
  async updatePie(pieId: string, request: UpdatePieRequest): Promise<Pie> {
    return this.request(`/equity/pies/${pieId}`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  /**
   * Delete a pie
   */
  async deletePie(pieId: string): Promise<void> {
    await this.request(`/equity/pies/${pieId}`, {
      method: "DELETE",
    });
  }

  /**
   * Duplicate a pie
   */
  async duplicatePie(pieId: string, request: DuplicatePieRequest): Promise<Pie> {
    return this.request(`/equity/pies/${pieId}/duplicate`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  /**
   * Fetch detailed information for a specific pie.
   */
  async fetchPieById(pieId: string): Promise<Pie> {
    return this.request(`/equity/pies/${pieId}`);
  }

  /**
   * Fetch all pies.
   */
  async fetchPies(): Promise<Pie[]> {
    return this.request("/equity/pies");
  }
}
