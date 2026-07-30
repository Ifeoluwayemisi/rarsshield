import { TransactionRepository } from "../repositories/TransactionRepository";
import { BMONIProvider } from "./BMONIProvider";

export class TransactionService {
  private transactionRepository = new TransactionRepository();
  private paymentProvider = new BMONIProvider();

  async createTransaction(
    userId: string,
    payload: {
      amount: number;
      currency?: string;
      beneficiary: string;
      description?: string;
    },
  ) {
    const providerResult = await this.paymentProvider.transfer({
      userId,
      amount: payload.amount,
      currency: payload.currency ?? "USD",
      beneficiary: payload.beneficiary,
      reference: `tx-${Date.now()}`,
    });

    return this.transactionRepository.create({
      userId,
      amount: payload.amount,
      currency: payload.currency ?? "USD",
      beneficiary: payload.beneficiary,
      description: payload.description,
      providerReference: providerResult.providerReference,
      status: providerResult.status,
    });
  }

  async getBalance(userId: string) {
    return this.paymentProvider.getBalance(userId);
  }

  async getHistory(userId: string) {
    return this.paymentProvider.transactionHistory(userId);
  }
}
