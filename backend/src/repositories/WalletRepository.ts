import { prisma } from "../database/prisma";

export class WalletRepository {
  async findByUserId(userId: string) {
    return prisma.wallet.findUnique({ where: { userId } });
  }

  async upsertForUser(
    userId: string,
    data: {
      balance: number;
      currency: string;
      provider: string;
      status: string;
      bmoniUserId?: string | null;
      smartWalletId?: string | null;
      metadata?: Record<string, unknown>;
    },
  ) {
    return prisma.wallet.upsert({
      where: { userId },
      update: {
        balance: data.balance,
        currency: data.currency,
        provider: data.provider,
        status: data.status,
      },
      create: {
        userId,
        balance: data.balance,
        currency: data.currency,
        provider: data.provider,
        status: data.status,
      },
    });
  }
}
