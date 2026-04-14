/**
 * Accounts Feature Client
 */

import { BaseClient } from "@/api/BaseClient.js";
import { AccountMetadata, AccountCash } from "./types.js";

export class AccountsClient extends BaseClient {
  /**
   * Fetch account summary
   */
  async fetchAccountMetadata(): Promise<AccountMetadata> {
    return this.request("/equity/account/summary");
  }

  /**
   * Fetch account cash data from summary endpoint
   */
  async fetchAccountCash(): Promise<AccountCash> {
    const summary = await this.fetchAccountMetadata();
    return summary.cash;
  }
}
