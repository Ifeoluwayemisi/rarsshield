import { prisma } from "../database/prisma";
import { User, Role } from "@prisma/client";

export class UserRepository {
  async create(data: {
    email: string;
    password: string;
    name?: string;
    role?: Role;
    isEmailVerified?: boolean;
  }): Promise<User> {
    return prisma.user.create({ data });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async update(
    id: string,
    data: Partial<Omit<User, "id" | "email" | "createdAt" | "updatedAt">>,
  ): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  }
}
