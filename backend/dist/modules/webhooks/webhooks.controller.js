"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const webhooks_service_1 = require("./webhooks.service");
const logger_1 = require("../../utils/logger");
const WalletRepository_1 = require("../../repositories/WalletRepository");
const prisma_1 = require("../../database/prisma");
const router = (0, express_1.Router)();
const walletRepository = new WalletRepository_1.WalletRepository();
const eventService = new webhooks_service_1.WebhookEventService(walletRepository, {
    create: async (data) => prisma_1.prisma.notification.create({ data: data }),
}, {
    create: async (data) => prisma_1.prisma.auditLog.create({ data: data }),
});
router.post("/events", async (req, res) => {
    const rawBody = req.rawBody?.toString("utf8");
    const payload = rawBody ?? JSON.stringify(req.body ?? {});
    const signature = req.get("x-webhook-signature");
    const secret = process.env.WEBHOOK_SECRET || process.env.BMONI_WEBHOOK_SECRET || "";
    if (!(0, webhooks_service_1.verifyWebhookSignature)(payload, signature, secret)) {
        logger_1.logger.warn("Rejected webhook with invalid signature");
        return res.status(401).json({ success: false, error: "Invalid signature" });
    }
    try {
        const result = await eventService.processWebhookEvent(req.body ?? {});
        return res.json({ success: true, data: result });
    }
    catch (error) {
        logger_1.logger.error({ error }, "Failed to process webhook event");
        return res
            .status(500)
            .json({ success: false, error: "Failed to process webhook" });
    }
});
exports.default = router;
//# sourceMappingURL=webhooks.controller.js.map