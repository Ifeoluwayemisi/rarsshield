import { prisma } from "../database/prisma";
import { Transaction, TransactionStatus } from "@prisma/client";

export class TransactionRepository {
  async create(data: {
    userId: string;
    amount: number;
    currency: string;
    description?: string;
    beneficiary: string;
    providerReference?: string;
    status: TransactionStatus;
  }): Promise<Transaction> {
    return prisma.transaction.create({ data });
  }
}
