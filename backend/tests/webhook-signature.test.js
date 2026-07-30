const crypto = require("crypto");
const {
  verifyWebhookSignature,
} = require("../dist/modules/webhooks/webhooks.service");

describe("verifyWebhookSignature", () => {
  it("accepts a valid HMAC-SHA256 signature", () => {
    const body = JSON.stringify({ eventType: "wallet.deposit.completed" });
    const secret = "test-secret";
    const signature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    expect(verifyWebhookSignature(body, signature, secret)).toBe(true);
  });

  it("rejects a mismatched signature", () => {
    const body = JSON.stringify({ eventType: "wallet.deposit.completed" });
    const secret = "test-secret";

    expect(verifyWebhookSignature(body, "bad-signature", secret)).toBe(false);
  });
});
