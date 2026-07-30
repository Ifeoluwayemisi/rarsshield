import { prisma } from "../database/prisma";
import { Settings } from "@prisma/client";

export class SettingsRepository {
  async getByUserId(userId: string): Promise<Settings> {
    // Ensure a settings row exists for the user
    let settings = await prisma.settings.findUnique({ where: { userId } });
    if (!settings) {
      settings = await prisma.settings.create({ data: { userId } });
    }
    return settings;
  }

  async updateByUserId(
    userId: string,
    data: Partial<Pick<Settings, "notificationEmail" | "notificationSms" | "privacyMode">>,
  ): Promise<Settings> {
    return prisma.settings.update({ where: { userId }, data });
  }
}
