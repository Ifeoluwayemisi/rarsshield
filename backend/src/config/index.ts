import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().default("4000"),
  APP_NAME: z.string().default("RARS Shield"),
  APP_URL: z.string().url(),
  TRUSTED_ORIGINS: z.string().default("http://localhost:3000"),
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_TOKEN_SECRET: z.string().min(32),
  JWT_REFRESH_TOKEN_SECRET: z.string().min(32),
  JWT_ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_TOKEN_EXPIRES_IN: z.string().default("30d"),
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_MODEL: z.string().default("gpt-4.1-mini"),
  REDIS_URL: z.string().url(),
  BMONI_BASE_URL: z.string().url().optional(),
  BMONI_API_KEY: z.string().optional(),
  USE_BMONI_SANDBOX: z.string().optional(),
  WEBHOOK_SECRET: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().default("RARS Shield <noreply@rarsshield.com>"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Environment validation error", parsed.error.format());
  throw new Error("Invalid environment configuration");
}

const env = parsed.data;

const config = {
  nodeEnv: env.NODE_ENV,
  port: Number(env.PORT),
  appName: env.APP_NAME,
  appUrl: env.APP_URL,
  trustedOrigins: env.TRUSTED_ORIGINS.split(",").map((origin) => origin.trim()),
  databaseUrl: env.DATABASE_URL,
  jwt: {
    accessTokenSecret: env.JWT_ACCESS_TOKEN_SECRET,
    refreshTokenSecret: env.JWT_REFRESH_TOKEN_SECRET,
    accessTokenExpiresIn: env.JWT_ACCESS_TOKEN_EXPIRES_IN,
    refreshTokenExpiresIn: env.JWT_REFRESH_TOKEN_EXPIRES_IN,
  },
  openai: {
    apiKey: env.OPENAI_API_KEY,
    model: env.OPENAI_MODEL,
  },
  redisUrl: env.REDIS_URL,
  // BMONI integration
  bmoni: {
    baseUrl: env.BMONI_BASE_URL || "https://embedded-dev.bmoni.com",
    apiKey: env.BMONI_API_KEY || "",
    useSandbox: env.USE_BMONI_SANDBOX === "true",
  },
  email: {
    from: env.EMAIL_FROM,
    smtpHost: env.SMTP_HOST,
    smtpPort: env.SMTP_PORT ? Number(env.SMTP_PORT) : undefined,
    smtpUser: env.SMTP_USER,
    smtpPassword: env.SMTP_PASSWORD,
  },
};

export default config;
