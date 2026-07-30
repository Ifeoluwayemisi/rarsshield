"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsRepository = void 0;
const prisma_1 = require("../database/prisma");
class SettingsRepository {
    async getByUserId(userId) {
        // Ensure a settings row exists for the user
        let settings = await prisma_1.prisma.settings.findUnique({ where: { userId } });
        if (!settings) {
            settings = await prisma_1.prisma.settings.create({ data: { userId } });
        }
        return settings;
    }
    async updateByUserId(userId, data) {
        return prisma_1.prisma.settings.update({ where: { userId }, data });
    }
}
exports.SettingsRepository = SettingsRepository;
//# sourceMappingURL=SettingsRepository.js.map