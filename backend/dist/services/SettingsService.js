"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const SettingsRepository_1 = require("../repositories/SettingsRepository");
const NotFoundError_1 = require("../errors/NotFoundError");
class SettingsService {
    repo = new SettingsRepository_1.SettingsRepository();
    async getSettings(userId) {
        const settings = await this.repo.getByUserId(userId);
        if (!settings)
            throw new NotFoundError_1.NotFoundError("Settings not found");
        return settings;
    }
    async updateSettings(userId, payload) {
        return this.repo.updateByUserId(userId, payload);
    }
}
exports.SettingsService = SettingsService;
//# sourceMappingURL=SettingsService.js.map