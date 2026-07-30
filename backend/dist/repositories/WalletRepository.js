"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletRepository = void 0;
const prisma_1 = require("../database/prisma");
class WalletRepository {
    async findByUserId(userId) {
        return prisma_1.prisma.wallet.findUnique({ where: { userId } });
    }
    async upsertForUser(userId, data) {
        return prisma_1.prisma.wallet.upsert({
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
exports.WalletRepository = WalletRepository;
//# sourceMappingURL=WalletRepository.js.map