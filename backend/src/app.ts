import express, { Request } from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import compression from "compression";
import pinoHttp from "pino-http";
import { logger } from "./utils/logger";
import config from "./config";
import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";
import { requestLogger } from "./middlewares/requestLogger";

const app = express();

app.use(helmet());
app.use(cors({ origin: config.trustedOrigins, credentials: true }));
app.use(compression());
app.use(
  express.json({
    limit: "10mb",
    verify: (req: Request, _res, buf) => {
      (req as Request & { rawBody?: Buffer }).rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(pinoHttp({ logger }));
app.use(requestLogger);

const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(apiRateLimiter);
app.use("/api", routes);

app.use(errorHandler);

export default app;
