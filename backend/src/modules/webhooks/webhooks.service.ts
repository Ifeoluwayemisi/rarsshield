import crypto from "crypto";
import { logger } from "../../utils/logger";

export function verifyWebhookSignature(
  payload: string,
  signature: string | undefined,
  secret: string,
): boolean {
  if (!signature || !secret) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  const expectedBuffer = Buffer.from(expected, "hex");
  const providedBuffer = Buffer.from(signature, "hex");

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
}

interface WalletRepoLike {
  findByUserId(
    userId: string,
  ): Promise<{
    balance: number | { toNumber(): number };
    currency: string;
    provider: string;
    status: string;
  } | null>;
  upsertForUser(
    userId: string,
    data: {
      balance: number;
      currency: string;
      provider: string;
      status: string;
      bmoniUserId?: string | null;
      smartWalletId?: string | null;
      metadata?: Record<string, unknown>;
    },
  ): Promise<unknown>;
}

interface NotificationRepoLike {
  create(data: Record<string, unknown>): Promise<unknown>;
}

interface AuditLogRepoLike {
  create(data: Record<string, unknown>): Promise<unknown>;
}

export class WebhookEventService {
  constructor(
    private readonly walletRepository: WalletRepoLike,
    private readonly notificationRepository: NotificationRepoLike,
    private readonly auditLogRepository: AuditLogRepoLike,
  ) {}

  async processWebhookEvent(event: Record<string, unknown>) {
    const eventType = typeof event.type === "string" ? event.type : "unknown";
    logger.info({ eventType }, "Received webhook event");

    if (eventType === "wallet.deposit.completed") {
      const userId =
        typeof event.userId === "string" ? event.userId : undefined;
      const amount = Number(event.amount ?? 0);
      const currency =
        typeof event.currency === "string" ? event.currency : "USD";

      if (!userId) {
        return { received: true, eventType };
      }

      const existingWallet = await this.walletRepository.findByUserId(userId);
      const currentBalance =
        typeof existingWallet?.balance === "number"
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

export async function processWebhookEvent(event: Record<string, unknown>) {
  const service = new WebhookEventService(
    { findByUserId: async () => null, upsertForUser: async () => null },
    { create: async () => null },
    { create: async () => null },
  );

  return service.processWebhookEvent(event);
}
