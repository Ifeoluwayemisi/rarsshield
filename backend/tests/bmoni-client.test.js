jest.mock("axios", () => ({
  __esModule: true,
  default: {
    create: () => ({
      defaults: { baseURL: "https://embedded-dev.bmoni.com" },
      get: jest
        .fn()
        .mockResolvedValue({ data: { status: "ok", version: "1.0" } }),
      post: jest.fn().mockResolvedValue({
        data: { id: "bmoni-user-123", email: "user@example.com" },
      }),
    }),
  },
}));

const { BMONIClient } = require("../dist/integrations/bmoni/BMONIClient");

describe("BMONIClient", () => {
  it("returns provider metadata for the API info endpoint", async () => {
    const client = new BMONIClient();
    const info = await client.getInfo();

    expect(info).toMatchObject({
      provider: "BMONI",
      connected: true,
      status: expect.any(String),
    });
  });

  it("creates a BMONI user and returns the upstream identifier", async () => {
    const client = new BMONIClient();
    const user = await client.createUser({
      email: "user@example.com",
      firstName: "Ada",
      lastName: "Lovelace",
    });

    expect(user).toMatchObject({
      id: "bmoni-user-123",
      email: "user@example.com",
    });
  });

  it("retrieves onboarding status for a user", async () => {
    const client = new BMONIClient();
    const onboarding = await client.getOnboardingStatus("bmoni-user-123");

    expect(onboarding).toMatchObject({
      status: "ok",
    });
  });

  it("starts Nigeria onboarding for a user", async () => {
    const client = new BMONIClient();
    const result = await client.startNigeriaOnboarding("bmoni-user-123", {
      bvn: "22222222222",
      walletAddress: "0xabc",
      walletIndex: 0,
    });

    expect(result).toMatchObject({
      id: "bmoni-user-123",
      email: "user@example.com",
    });
  });
});
