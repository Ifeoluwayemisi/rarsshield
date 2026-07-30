import { Router } from "express";
import authRouter from "../modules/auth/auth.controller";
import userRouter from "../modules/users/users.controller";
import transactionsRouter from "../modules/transactions/transactions.controller";
import analysisRouter from "../modules/scam-analysis/analysis.controller";
import walletRouter from "../modules/wallet/wallet.controller";
import financialInsightsRouter from "../modules/financial-insights/financial-insights.controller";
import webhooksRouter from "../modules/webhooks/webhooks.controller";

const router = Router();

router.get("/health", (_req, res) =>
  res.json({ status: "ok", service: "RARS Shield" }),
);
router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/transactions", transactionsRouter);
router.use("/analysis", analysisRouter);
router.use("/wallet", walletRouter);
router.use("/financial-insights", financialInsightsRouter);
router.use("/webhooks", webhooksRouter);

export default router;
