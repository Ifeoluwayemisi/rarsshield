import { TransactionStatus } from "@prisma/client";

export interface PaymentProvider {
  createWallet(userId: string): Promise<{ walletId: string; balance: number }>;
  verifyAccount(
    accountNumber: string,
    bankCode: string,
  ): Promise<{ valid: boolean; accountName?: string }>;
  transfer(params: {
    userId: string;
    amount: number;
    currency: string;
    beneficiary: string;
    reference: string;
  }): Promise<{ providerReference: string; status: TransactionStatus }>;
  getBalance(userId: string): Promise<{ balance: number; currency: string }>;
  transactionHistory(
    userId: string,
    limit?: number,
  ): Promise<
    Array<{
      providerReference: string;
      amount: number;
      currency: string;
      status: TransactionStatus;
      createdAt: string;
    }>
  >;
  verifyTransaction(
    providerReference: string,
  ): Promise<{ verified: boolean; status: TransactionStatus }>;
  createBeneficiary(
    userId: string,
    beneficiary: { name: string; accountNumber: string; bankCode: string },
  ): Promise<{ beneficiaryId: string; verified: boolean }>;
  reverseTransaction(
    providerReference: string,
  ): Promise<{ providerReference: string; status: TransactionStatus }>;
}
