import { Router } from "express";
import authRouter from "../modules/auth/auth.controller";
import userRouter from "../modules/users/users.controller";
import transactionsRouter from "../modules/transactions/transactions.controller";
import analysisRouter from "../modules/scam-analysis/analysis.controller";
import walletRouter from "../modules/wallet/wallet.controller";
import financialInsightsRouter from "../modules/financial-insights/financial-insights.controller";
import webhooksRouter from "../modules/webhooks/webhooks.controller";
import swaggerRouter from "../routes/swagger";
import settingsRouter from "../modules/users/settings.controller";
import { AIService } from "../services/aiService";

const router = Router();

router.get("/health", (_req, res) =>
  res.json({ status: "ok", service: "RARS Shield" }),
);

router.get("/health/ai", async (_req, res) => {
  const aiService = new AIService();

  try {
    const result = await aiService.analyzeRisk({
      type: "HEALTH_CHECK",
      content: "Test message for AI connectivity",
    });

    res.json({
      status: "ok",
      service: "ai",
      healthy: true,
      result,
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      service: "ai",
      healthy: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/settings", settingsRouter);
router.use("/transactions", transactionsRouter);
router.use("/analysis", analysisRouter);
router.use("/wallet", walletRouter);
router.use("/financial-insights", financialInsightsRouter);
router.use("/webhooks", webhooksRouter);
router.use("/docs", swaggerRouter);

export default router;
