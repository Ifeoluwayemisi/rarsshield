const mockFindByEmail = jest.fn();
const mockCreateUser = jest.fn();
const mockFindById = jest.fn();
const mockUpdateUser = jest.fn();
const mockCreateRefreshToken = jest.fn();
const mockFindRefreshTokenByToken = jest.fn();
const mockRevokeRefreshToken = jest.fn();
const mockRevokeRefreshTokenByToken = jest.fn();
const mockSendMail = jest.fn();

jest.mock("../dist/repositories/UserRepository", () => ({
  UserRepository: jest.fn().mockImplementation(() => ({
    findByEmail: mockFindByEmail,
    create: mockCreateUser,
    findById: mockFindById,
    update: mockUpdateUser,
  })),
}));

jest.mock("../dist/repositories/RefreshTokenRepository", () => ({
  RefreshTokenRepository: jest.fn().mockImplementation(() => ({
    create: mockCreateRefreshToken,
    findByToken: mockFindRefreshTokenByToken,
    revoke: mockRevokeRefreshToken,
    revokeByToken: mockRevokeRefreshTokenByToken,
  })),
}));

jest.mock("../dist/services/EmailService", () => ({
  EmailService: jest.fn().mockImplementation(() => ({
    sendMail: mockSendMail,
  })),
}));

const { AuthService } = require("../dist/services/AuthService");

describe("AuthService signup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFindByEmail.mockResolvedValue(null);
    mockCreateUser.mockResolvedValue({
      id: "user-1",
      email: "demo@example.com",
      password: "hashed",
      role: "USER",
      isEmailVerified: false,
    });
    mockCreateRefreshToken.mockResolvedValue({ id: "refresh-1" });
    mockFindById.mockResolvedValue({
      id: "user-1",
      email: "demo@example.com",
      password: "hashed",
      role: "USER",
      isEmailVerified: false,
    });
    mockUpdateUser.mockResolvedValue({ id: "user-1" });
    mockSendMail.mockRejectedValue(new Error("smtp failed"));
  });

  it("does not fail signup when the verification email cannot be sent", async () => {
    const service = new AuthService();

    await expect(
      service.signup({
        email: "demo@example.com",
        password: "DemoPass123!",
        name: "Demo User",
      }),
    ).resolves.toMatchObject({
      message: expect.stringContaining("Signup successful"),
      tokens: expect.objectContaining({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      }),
    });

    expect(mockSendMail).toHaveBeenCalled();
  });
});
