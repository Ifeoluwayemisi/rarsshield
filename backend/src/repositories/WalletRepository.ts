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
    const updateData: Record<string, unknown> = {
      balance: data.balance,
      currency: data.currency,
      provider: data.provider,
      status: data.status,
    };
    if (data.bmoniUserId !== undefined) {
      updateData.bmoniUserId = data.bmoniUserId;
    }
    if (data.smartWalletId !== undefined) {
      updateData.smartWalletId = data.smartWalletId;
    }
    if (data.metadata !== undefined) {
      updateData.metadata = data.metadata as any;
    }

    return prisma.wallet.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        balance: data.balance,
        currency: data.currency,
        provider: data.provider,
        status: data.status,
        bmoniUserId: data.bmoniUserId ?? null,
        smartWalletId: data.smartWalletId ?? null,
        metadata: (data.metadata as any) ?? undefined,
      },
    });
  }
}
