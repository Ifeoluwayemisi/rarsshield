"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./config"));
const logger_1 = require("./utils/logger");
const prisma_1 = require("./database/prisma");
const port = config_1.default.port;
async function start() {
    try {
        await prisma_1.prisma.$connect();
        app_1.default.listen(port, () => {
            logger_1.logger.info({ port, env: config_1.default.nodeEnv }, "RARS Shield backend started");
        });
    }
    catch (error) {
        logger_1.logger.error({ error }, "Failed to start application");
        process.exit(1);
    }
}
start();
//# sourceMappingURL=index.js.map