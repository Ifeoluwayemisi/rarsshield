import { PrismaConfig } from "@prisma/client";

const config: PrismaConfig = {
  adapter: {
    type: "postgresql",
    url: process.env.DATABASE_URL ?? "",
  },
};

export default config;
