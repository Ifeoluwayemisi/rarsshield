import { BmoniClient } from "../http/bmoni.client";
import { BmoniWalletMapper } from "../mappers/bmoni-wallet.mapper";
import {
  BalanceResponse,
  TransactionResponse,
  WalletSummaryResponse,
} from "../types/dto";

export class BmoniWalletRepository {
  constructor(private readonly client: BmoniClient = new BmoniClient()) {}

  async getWalletSummary(userId: string): Promise<WalletSummaryResponse> {
    const response = await this.client.getAccountSummary(userId);
    const payload =
      Array.isArray(response) && response.length ? response[0] : {};
    return BmoniWalletMapper.toDto(payload as Record<string, unknown>);
  }

  async getBalance(userId: string): Promise<BalanceResponse> {
    const wallet = await this.getWalletSummary(userId);
    return {
      balance: wallet.balance,
      currency: wallet.currency,
      status: wallet.status,
    };
  }

  async getTransactions(userId: string): Promise<TransactionResponse[]> {
    const response = await this.client.getTransactions(userId);
    const items = Array.isArray(response) ? response : [];

    return items.map((item: Record<string, unknown>) => ({
      id: typeof item.id === "string" ? item.id : "",
      amount: Number(item.amount ?? 0),
      currency: typeof item.currency === "string" ? item.currency : "USD",
      status: typeof item.status === "string" ? item.status : "UNKNOWN",
      description:
        typeof item.description === "string" ? item.description : undefined,
    }));
  }
}
