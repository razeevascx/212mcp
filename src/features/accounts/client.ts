/**
 * Accounts Feature Client
 */

import { BaseClient } from "@/api/BaseClient.js";
import { AccountSummary, AccountCash } from "./types.js";

export class AccountsClient extends BaseClient {
  /**
   * Fetch account summary
   */
  async fetchAccountMetadata(): Promise<AccountSummary> {
    return this.request("/equity/account/summary");
  }

  /**
   * Fetch account cash data
   */
  async fetchAccountCash(): Promise<AccountCash> {
    return this.request("/equity/account/cash");
  }
}
