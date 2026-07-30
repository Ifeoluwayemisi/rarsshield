const {
  WebhookEventService,
} = require("../dist/modules/webhooks/webhooks.service");

describe("WebhookEventService", () => {
  it("updates wallet balance and creates notification and audit entries for a deposit completion event", async () => {
    const walletRepo = {
      findByUserId: jest.fn().mockResolvedValue({
        balance: 100,
        currency: "USD",
        provider: "BMONI",
        status: "ACTIVE",
      }),
      upsertForUser: jest.fn().mockResolvedValue({ balance: 150 }),
    };

    const notificationRepo = {
      create: jest.fn().mockResolvedValue({ id: "notif-1" }),
    };

    const auditLogRepo = {
      create: jest.fn().mockResolvedValue({ id: "audit-1" }),
    };

    const service = new WebhookEventService(
      walletRepo,
      notificationRepo,
      auditLogRepo,
    );

    const result = await service.processWebhookEvent({
      type: "wallet.deposit.completed",
      userId: "user-1",
      amount: 50,
      currency: "USD",
      status: "COMPLETED",
    });

    expect(walletRepo.upsertForUser).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({
        balance: 150,
        currency: "USD",
        status: "ACTIVE",
      }),
    );
    expect(notificationRepo.create).toHaveBeenCalled();
    expect(auditLogRepo.create).toHaveBeenCalled();
    expect(result.eventType).toBe("wallet.deposit.completed");
  });
});
