import app from "./app";
import config from "./config";
import { logger } from "./utils/logger";
import { prisma } from "./database/prisma";

const port = config.port;

async function start() {
  try {
    await prisma.$connect();
    app.listen(port, () => {
      logger.info({ port, env: config.nodeEnv }, "RARS Shield backend started");
    });
  } catch (error) {
    logger.error({ error }, "Failed to start application");
    process.exit(1);
  }
}

start();
