"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = requestLogger;
const logger_1 = require("../utils/logger");
function requestLogger(req, _res, next) {
    logger_1.logger.info({ method: req.method, path: req.path, query: req.query, body: req.body }, "Incoming request");
    next();
}
//# sourceMappingURL=requestLogger.js.map