import { createClient } from "redis";
import config from "../config";
import { logger } from "../utils/logger";

export const redisClient = createClient({ url: config.redisUrl });

redisClient.on("error", (error) => {
  logger.error({ error }, "Redis client error");
});

export async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    logger.info("Connected to Redis");
  }
}
