"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z
        .enum(["development", "production", "test"])
        .default("development"),
    PORT: zod_1.z.string().default("4000"),
    APP_NAME: zod_1.z.string().default("RARS Shield"),
    APP_URL: zod_1.z.string().url(),
    TRUSTED_ORIGINS: zod_1.z.string().default("http://localhost:3000"),
    DATABASE_URL: zod_1.z.string().url(),
    JWT_ACCESS_TOKEN_SECRET: zod_1.z.string().min(32),
    JWT_REFRESH_TOKEN_SECRET: zod_1.z.string().min(32),
    JWT_ACCESS_TOKEN_EXPIRES_IN: zod_1.z.string().default("15m"),
    JWT_REFRESH_TOKEN_EXPIRES_IN: zod_1.z.string().default("30d"),
    OPENAI_API_KEY: zod_1.z.string().min(1),
    OPENAI_MODEL: zod_1.z.string().default("gpt-4.1-mini"),
    REDIS_URL: zod_1.z.string().url(),
    BMONI_BASE_URL: zod_1.z.string().url().optional(),
    BMONI_API_BASE_URL: zod_1.z.string().url().optional(),
    BMONI_API_KEY: zod_1.z.string().optional(),
    USE_BMONI_SANDBOX: zod_1.z.string().optional(),
    WEBHOOK_SECRET: zod_1.z.string().optional(),
    SMTP_HOST: zod_1.z.string().optional(),
    SMTP_PORT: zod_1.z.string().optional(),
    SMTP_USER: zod_1.z.string().optional(),
    SMTP_PASSWORD: zod_1.z.string().optional(),
    EMAIL_FROM: zod_1.z.string().default("RARS Shield <noreply@rarsshield.com>"),
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
        baseUrl: env.BMONI_BASE_URL || env.BMONI_API_BASE_URL || "https://embedded-dev.bmoni.com",
        apiKey: env.BMONI_API_KEY || "pk_a025cacbf33a_76fb864113f3540909de5b1da39cc146906e35b1c6d4d1e4",
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
exports.default = config;
//# sourceMappingURL=index.js.map