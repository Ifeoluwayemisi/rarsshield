"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
exports.connectRedis = connectRedis;
const redis_1 = require("redis");
const config_1 = __importDefault(require("../config"));
const logger_1 = require("../utils/logger");
exports.redisClient = (0, redis_1.createClient)({ url: config_1.default.redisUrl });
exports.redisClient.on("error", (error) => {
    logger_1.logger.error({ error }, "Redis client error");
});
async function connectRedis() {
    if (!exports.redisClient.isOpen) {
        await exports.redisClient.connect();
        logger_1.logger.info("Connected to Redis");
    }
}
//# sourceMappingURL=redis.js.map