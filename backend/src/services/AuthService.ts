import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config";
import { UserRepository } from "../repositories/UserRepository";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import { ValidationError } from "../errors/ValidationError";
import { RefreshTokenRepository } from "../repositories/RefreshTokenRepository";
import { Role } from "@prisma/client";
import { EmailService } from "./EmailService";

export class AuthService {
  private userRepository = new UserRepository();
  private refreshTokenRepository = new RefreshTokenRepository();
  private emailService = new EmailService();

  async signup(payload: { email: string; password: string; name?: string }) {
    const existing = await this.userRepository.findByEmail(payload.email);
    if (existing) {
      throw new ValidationError("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(payload.password, 12);
    const user = await this.userRepository.create({
      email: payload.email,
      password: hashedPassword,
      name: payload.name,
      role: Role.USER,
      isEmailVerified: false,
    });

    const verificationToken = this.signToken(user.id, config.jwt.accessTokenSecret, "1d");
    await this.sendVerificationEmail(user.email, verificationToken);

    return {
      tokens: await this.createTokensForUser(user.id),
      message: "Signup successful. Please verify your email.",
    };
  }

  async login(payload: { email: string; password: string }) {
    const user = await this.userRepository.findByEmail(payload.email);
    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const isValidPassword = await bcrypt.compare(
      payload.password,
      user.password,
    );
    if (!isValidPassword) {
      throw new UnauthorizedError("Invalid credentials");
    }

    return this.createTokensForUser(user.id);
  }

  async googleAuth(payload: { idToken: string; name?: string }) {
    const email = this.extractGoogleEmail(payload.idToken);
    const existing = await this.userRepository.findByEmail(email);

    if (existing) {
      return this.createTokensForUser(existing.id);
    }

    const randomPassword = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const hashedRandomPassword = await bcrypt.hash(randomPassword, 12);
    const user = await this.userRepository.create({
      email,
      password: hashedRandomPassword,
      name: payload.name || email.split("@")[0],
      role: Role.USER,
      isEmailVerified: true,
    });

    return this.createTokensForUser(user.id);
  }

  async forgotPassword(payload: { email: string }) {
    const user = await this.userRepository.findByEmail(payload.email);
    if (!user) {
      return { message: "If an account exists, a reset email has been sent." };
    }

    const resetToken = this.signToken(user.id, config.jwt.accessTokenSecret, "1h");
    await this.sendPasswordResetEmail(user.email, resetToken);

    return { message: "If an account exists, a reset email has been sent." };
  }

  async resetPassword(payload: { token: string; password: string }) {
    const decoded = jwt.verify(payload.token, config.jwt.accessTokenSecret) as { sub?: string };
    if (!decoded.sub) {
      throw new UnauthorizedError("Reset token invalid");
    }

    const user = await this.userRepository.findById(decoded.sub);
    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    const hashedPassword = await bcrypt.hash(payload.password, 12);
    await this.userRepository.update(user.id, { password: hashedPassword });

    return { message: "Password reset successful" };
  }

  async verifyEmail(token: string) {
    const decoded = jwt.verify(token, config.jwt.accessTokenSecret) as { sub?: string };
    if (!decoded.sub) {
      throw new UnauthorizedError("Verification token invalid");
    }

    const user = await this.userRepository.findById(decoded.sub);
    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    await this.userRepository.update(user.id, { isEmailVerified: true });
    return { message: "Email verified successfully" };
  }

  async refreshToken(token: string) {
    const existing = await this.refreshTokenRepository.findByToken(token);
    if (!existing || existing.revoked || existing.expiresAt < new Date()) {
      throw new UnauthorizedError("Refresh token invalid or expired");
    }

    const user = await this.userRepository.findById(existing.userId);
    if (!user) {
      throw new UnauthorizedError("Refresh token owner not found");
    }

    await this.refreshTokenRepository.revoke(existing.id);
    return this.createTokensForUser(user.id);
  }

  async logout(token: string) {
    await this.refreshTokenRepository.revokeByToken(token);
  }

  private signToken(subject: string, secret: string, expiresIn: string) {
    return jwt.sign({ sub: subject }, secret, {
      expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
    });
  }

  private extractGoogleEmail(idToken: string) {
    const [, payload] = idToken.split(".");
    if (!payload) {
      throw new ValidationError("Invalid Google token");
    }

    const decoded = Buffer.from(payload, "base64").toString("utf8");
    const parsed = JSON.parse(decoded) as { email?: string };
    if (!parsed.email) {
      throw new ValidationError("Google token does not contain an email");
    }

    return parsed.email;
  }

  private async sendVerificationEmail(email: string, token: string) {
    const link = `${config.appUrl}/auth/verify-email?token=${token}`;
    await this.emailService.sendMail(
      email,
      "Verify your RARS Shield email",
      `<p>Welcome to RARS Shield.</p><p>Verify your email by clicking <a href="${link}">here</a>.</p>`,
    );
  }

  private async sendPasswordResetEmail(email: string, token: string) {
    const link = `${config.appUrl}/auth/reset-password?token=${token}`;
    await this.emailService.sendMail(
      email,
      "Reset your RARS Shield password",
      `<p>Click <a href="${link}">here</a> to reset your password.</p>`,
    );
  }

  private async createTokensForUser(userId: string) {
    const accessToken = this.signToken(
      userId,
      config.jwt.accessTokenSecret,
      config.jwt.accessTokenExpiresIn,
    );
    const refreshToken = this.signToken(
      userId,
      config.jwt.refreshTokenSecret,
      config.jwt.refreshTokenExpiresIn,
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.refreshTokenRepository.create({
      token: refreshToken,
      userId,
      expiresAt,
    });

    return { accessToken, refreshToken };
  }
}
