import { Request, Response, NextFunction } from "express";
import { BaseError } from "../errors/BaseError";
import { logger } from "../utils/logger";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const statusCode = err instanceof BaseError ? err.statusCode : 500;
  const message =
    err instanceof BaseError ? err.message : "Internal server error";

  logger.error(
    { err, path: req.path, method: req.method, body: req.body },
    "Unhandled error",
  );

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
    },
  });
}
