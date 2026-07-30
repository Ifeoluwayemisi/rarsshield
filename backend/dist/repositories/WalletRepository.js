"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletRepository = void 0;
const prisma_1 = require("../database/prisma");
class WalletRepository {
    async findByUserId(userId) {
        return prisma_1.prisma.wallet.findUnique({ where: { userId } });
    }
    async upsertForUser(userId, data) {
        const updateData = {
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
            updateData.metadata = data.metadata;
        }
        return prisma_1.prisma.wallet.upsert({
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
                metadata: data.metadata ?? undefined,
            },
        });
    }
}
exports.WalletRepository = WalletRepository;
//# sourceMappingURL=WalletRepository.js.map