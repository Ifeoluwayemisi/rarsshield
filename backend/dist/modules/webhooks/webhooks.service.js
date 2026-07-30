"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookEventService = void 0;
exports.verifyWebhookSignature = verifyWebhookSignature;
exports.processWebhookEvent = processWebhookEvent;
const crypto_1 = __importDefault(require("crypto"));
const logger_1 = require("../../utils/logger");
function verifyWebhookSignature(payload, signature, secret) {
    if (!signature || !secret) {
        return false;
    }
    const expected = crypto_1.default
        .createHmac("sha256", secret)
        .update(payload)
        .digest("hex");
    const expectedBuffer = Buffer.from(expected, "hex");
    const providedBuffer = Buffer.from(signature, "hex");
    if (expectedBuffer.length !== providedBuffer.length) {
        return false;
    }
    return crypto_1.default.timingSafeEqual(expectedBuffer, providedBuffer);
}
class WebhookEventService {
    walletRepository;
    notificationRepository;
    auditLogRepository;
    constructor(walletRepository, notificationRepository, auditLogRepository) {
        this.walletRepository = walletRepository;
        this.notificationRepository = notificationRepository;
        this.auditLogRepository = auditLogRepository;
    }
    async processWebhookEvent(event) {
        const eventType = typeof event.type === "string" ? event.type : "unknown";
        logger_1.logger.info({ eventType }, "Received webhook event");
        if (eventType === "wallet.deposit.completed") {
            const userId = typeof event.userId === "string" ? event.userId : undefined;
            const amount = Number(event.amount ?? 0);
            const currency = typeof event.currency === "string" ? event.currency : "USD";
            if (!userId) {
                return { received: true, eventType };
            }
            const existingWallet = await this.walletRepository.findByUserId(userId);
            const currentBalance = typeof existingWallet?.balance === "number"
                ? existingWallet.balance
                : existingWallet?.balance &&
                    typeof existingWallet.balance.toNumber === "function"
                    ? existingWallet.balance.toNumber()
                    : 0;
            const nextBalance = currentBalance + amount;
            await this.walletRepository.upsertForUser(userId, {
                balance: nextBalance,
                currency,
                provider: existingWallet?.provider ?? "BMONI",
                status: existingWallet?.status ?? "ACTIVE",
                metadata: { lastWebhookEvent: eventType },
            });
            await this.notificationRepository.create({
                userId,
                channel: "PUSH",
                title: "Wallet deposit completed",
                message: `Your wallet deposit of ${currency} ${amount} has been completed.`,
                data: { eventType },
            });
            await this.auditLogRepository.create({
                userId,
                action: "webhook.received",
                resource: "wallet",
                metadata: { eventType, amount, currency },
            });
        }
        return {
            received: true,
            eventType,
        };
    }
}
exports.WebhookEventService = WebhookEventService;
async function processWebhookEvent(event) {
    const service = new WebhookEventService({ findByUserId: async () => null, upsertForUser: async () => null }, { create: async () => null }, { create: async () => null });
    return service.processWebhookEvent(event);
}
//# sourceMappingURL=webhooks.service.js.map