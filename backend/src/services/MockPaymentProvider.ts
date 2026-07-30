import { PaymentProvider } from "../interfaces/PaymentProvider";
import { TransactionStatus } from "@prisma/client";

export class MockPaymentProvider implements PaymentProvider {
  async createWallet(userId: string) {
    return { walletId: `mock-wallet-${userId}`, balance: 1000.0 };
  }

  async verifyAccount(accountNumber: string, bankCode: string) {
    return {
      valid: accountNumber.length === 10 && bankCode.length > 0,
      accountName: "Mock Account",
    };
  }

  async transfer(params: {
    userId: string;
    amount: number;
    currency: string;
    beneficiary: string;
    reference: string;
  }) {
    return {
      providerReference: `mock-tx-${params.reference}`,
      status:
        params.amount > 0
          ? TransactionStatus.COMPLETED
          : TransactionStatus.FAILED,
    };
  }

  async getBalance(_userId: string) {
    return { balance: 1000.0, currency: "USD" };
  }

  async transactionHistory(userId: string, limit = 20) {
    return Array.from({ length: Math.min(limit, 5) }, (_, index) => ({
      providerReference: `mock-tx-${userId}-${index}`,
      amount: 100 + index * 10,
      currency: "USD",
      status: TransactionStatus.COMPLETED,
      createdAt: new Date().toISOString(),
    }));
  }

  async verifyTransaction(_providerReference: string) {
    return { verified: true, status: TransactionStatus.COMPLETED };
  }

  async createBeneficiary(
    userId: string,
    beneficiary: { name: string; accountNumber: string; bankCode: string },
  ) {
    return {
      beneficiaryId: `mock-beneficiary-${userId}-${beneficiary.accountNumber}`,
      verified: true,
    };
  }

  async reverseTransaction(providerReference: string) {
    return { providerReference, status: TransactionStatus.REVERSED };
  }
}
