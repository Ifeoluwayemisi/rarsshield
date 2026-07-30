import { prisma } from "../database/prisma";
import { RefreshToken } from "@prisma/client";

export class RefreshTokenRepository {
  async create(data: {
    token: string;
    userId: string;
    expiresAt: Date;
  }): Promise<RefreshToken> {
    return prisma.refreshToken.create({ data });
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findUnique({ where: { token } });
  }

  async revoke(id: string): Promise<RefreshToken> {
    return prisma.refreshToken.update({
      where: { id },
      data: { revoked: true },
    });
  }

  async revokeByToken(token: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.update({
      where: { token },
      data: { revoked: true },
    });
  }
}
