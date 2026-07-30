"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenRepository = void 0;
const prisma_1 = require("../database/prisma");
class RefreshTokenRepository {
    async create(data) {
        return prisma_1.prisma.refreshToken.create({ data });
    }
    async findByToken(token) {
        return prisma_1.prisma.refreshToken.findUnique({ where: { token } });
    }
    async revoke(id) {
        return prisma_1.prisma.refreshToken.update({
            where: { id },
            data: { revoked: true },
        });
    }
    async revokeByToken(token) {
        return prisma_1.prisma.refreshToken.update({
            where: { token },
            data: { revoked: true },
        });
    }
}
exports.RefreshTokenRepository = RefreshTokenRepository;
//# sourceMappingURL=RefreshTokenRepository.js.map