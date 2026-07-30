import { Request, Response, Router } from "express";
import {
  verifyWebhookSignature,
  WebhookEventService,
} from "./webhooks.service";
import { logger } from "../../utils/logger";
import { WalletRepository } from "../../repositories/WalletRepository";
import { prisma } from "../../database/prisma";

const router = Router();
const walletRepository = new WalletRepository();
const eventService = new WebhookEventService(
  walletRepository,
  {
    create: async (data) => prisma.notification.create({ data: data as never }),
  },
  {
    create: async (data) => prisma.auditLog.create({ data: data as never }),
  },
);

router.post("/events", async (req: Request, res: Response) => {
  const rawBody = (req as Request & { rawBody?: Buffer }).rawBody?.toString(
    "utf8",
  );
  const payload = rawBody ?? JSON.stringify(req.body ?? {});
  const signature = req.get("x-webhook-signature");
  const secret =
    process.env.WEBHOOK_SECRET || process.env.BMONI_WEBHOOK_SECRET || "";

  if (!verifyWebhookSignature(payload, signature, secret)) {
    logger.warn("Rejected webhook with invalid signature");
    return res.status(401).json({ success: false, error: "Invalid signature" });
  }

  try {
    const result = await eventService.processWebhookEvent(req.body ?? {});
    return res.json({ success: true, data: result });
  } catch (error) {
    logger.error({ error }, "Failed to process webhook event");
    return res
      .status(500)
      .json({ success: false, error: "Failed to process webhook" });
  }
});

export default router;
