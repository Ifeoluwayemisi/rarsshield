import { PaymentProvider } from "../interfaces/PaymentProvider";
import { TransactionStatus } from "@prisma/client";
import { BMONIService } from "../integrations/bmoni/BMONIService";

export class BMONIProvider implements PaymentProvider {
  private bmoniService = new BMONIService();

  async createWallet(userId: string) {
    const wallet = await this.bmoniService.syncWallet(userId);
    return { walletId: wallet.id, balance: Number(wallet.balance) };
  }

  async verifyAccount(accountNumber: string, bankCode: string) {
    return {
      valid: accountNumber.length === 10 && bankCode.length > 0,
      accountName: "BMONI Verified Account",
    };
  }

  async transfer(params: {
    userId: string;
    amount: number;
    currency: string;
    beneficiary: string;
    reference: string;
  }) {
    await this.bmoniService.syncWallet(params.userId);

    return {
      providerReference: `bmoni-${params.reference}`,
      status:
        params.amount > 0
          ? TransactionStatus.COMPLETED
          : TransactionStatus.FAILED,
    };
  }

  async getBalance(userId: string) {
    const wallet = await this.bmoniService.getWallet(userId);
    return {
      balance: wallet ? Number(wallet.balance) : 0,
      currency: wallet?.currency ?? "USD",
    };
  }

  async transactionHistory(userId: string, limit = 20) {
    const wallet = await this.bmoniService.getWallet(userId);

    return [
      {
        providerReference: `bmoni-${userId}`,
        amount: wallet ? Number(wallet.balance) : 0,
        currency: wallet?.currency ?? "USD",
        status: TransactionStatus.COMPLETED,
        createdAt: new Date().toISOString(),
      },
    ].slice(0, Math.min(limit, 5));
  }

  async verifyTransaction(providerReference: string) {
    return {
      verified: true,
      status: TransactionStatus.COMPLETED,
      providerReference,
    };
  }

  async createBeneficiary(
    userId: string,
    beneficiary: { name: string; accountNumber: string; bankCode: string },
  ) {
    return {
      beneficiaryId: `bmoni-beneficiary-${userId}-${beneficiary.accountNumber}`,
      verified: true,
    };
  }

  async reverseTransaction(providerReference: string) {
    return { providerReference, status: TransactionStatus.REVERSED };
  }
}
