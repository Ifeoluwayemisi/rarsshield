"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const BaseError_1 = require("../errors/BaseError");
const logger_1 = require("../utils/logger");
function errorHandler(err, req, res, _next) {
    const statusCode = err instanceof BaseError_1.BaseError ? err.statusCode : 500;
    const message = err instanceof BaseError_1.BaseError ? err.message : "Internal server error";
    logger_1.logger.error({ err, path: req.path, method: req.method, body: req.body }, "Unhandled error");
    res.status(statusCode).json({
        success: false,
        error: {
            message,
            statusCode,
        },
    });
}
//# sourceMappingURL=errorHandler.js.map