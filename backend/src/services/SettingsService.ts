import { SettingsRepository } from "../repositories/SettingsRepository";
import { NotFoundError } from "../errors/NotFoundError";

export class SettingsService {
  private repo = new SettingsRepository();

  async getSettings(userId: string) {
    const settings = await this.repo.getByUserId(userId);
    if (!settings) throw new NotFoundError("Settings not found");
    return settings;
  }

  async updateSettings(
    userId: string,
    payload: Partial<{
      notificationEmail: boolean;
      notificationSms: boolean;
      privacyMode: boolean;
    }>
  ) {
    return this.repo.updateByUserId(userId, payload);
  }
}
