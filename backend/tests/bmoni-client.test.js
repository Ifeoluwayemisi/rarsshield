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
});
