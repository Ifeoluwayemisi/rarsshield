"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const UserRepository_1 = require("../repositories/UserRepository");
const UnauthorizedError_1 = require("../errors/UnauthorizedError");
const ValidationError_1 = require("../errors/ValidationError");
const RefreshTokenRepository_1 = require("../repositories/RefreshTokenRepository");
const client_1 = require("@prisma/client");
const EmailService_1 = require("./EmailService");
class AuthService {
    userRepository = new UserRepository_1.UserRepository();
    refreshTokenRepository = new RefreshTokenRepository_1.RefreshTokenRepository();
    emailService = new EmailService_1.EmailService();
    async signup(payload) {
        const existing = await this.userRepository.findByEmail(payload.email);
        if (existing) {
            throw new ValidationError_1.ValidationError("Email already registered");
        }
        const hashedPassword = await bcrypt_1.default.hash(payload.password, 12);
        const user = await this.userRepository.create({
            email: payload.email,
            password: hashedPassword,
            name: payload.name,
            role: client_1.Role.USER,
            isEmailVerified: false,
        });
        const verificationToken = this.signToken(user.id, config_1.default.jwt.accessTokenSecret, "1d");
        await this.sendVerificationEmail(user.email, verificationToken);
        return {
            tokens: await this.createTokensForUser(user.id),
            message: "Signup successful. Please verify your email.",
        };
    }
    async login(payload) {
        const user = await this.userRepository.findByEmail(payload.email);
        if (!user) {
            throw new UnauthorizedError_1.UnauthorizedError("Invalid credentials");
        }
        const isValidPassword = await bcrypt_1.default.compare(payload.password, user.password);
        if (!isValidPassword) {
            throw new UnauthorizedError_1.UnauthorizedError("Invalid credentials");
        }
        return this.createTokensForUser(user.id);
    }
    async googleAuth(payload) {
        const email = this.extractGoogleEmail(payload.idToken);
        const existing = await this.userRepository.findByEmail(email);
        if (existing) {
            return this.createTokensForUser(existing.id);
        }
        const randomPassword = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const hashedRandomPassword = await bcrypt_1.default.hash(randomPassword, 12);
        const user = await this.userRepository.create({
            email,
            password: hashedRandomPassword,
            name: payload.name || email.split("@")[0],
            role: client_1.Role.USER,
            isEmailVerified: true,
        });
        return this.createTokensForUser(user.id);
    }
    async forgotPassword(payload) {
        const user = await this.userRepository.findByEmail(payload.email);
        if (!user) {
            return { message: "If an account exists, a reset email has been sent." };
        }
        const resetToken = this.signToken(user.id, config_1.default.jwt.accessTokenSecret, "1h");
        await this.sendPasswordResetEmail(user.email, resetToken);
        return { message: "If an account exists, a reset email has been sent." };
    }
    async resetPassword(payload) {
        const decoded = jsonwebtoken_1.default.verify(payload.token, config_1.default.jwt.accessTokenSecret);
        if (!decoded.sub) {
            throw new UnauthorizedError_1.UnauthorizedError("Reset token invalid");
        }
        const user = await this.userRepository.findById(decoded.sub);
        if (!user) {
            throw new UnauthorizedError_1.UnauthorizedError("User not found");
        }
        const hashedPassword = await bcrypt_1.default.hash(payload.password, 12);
        await this.userRepository.update(user.id, { password: hashedPassword });
        return { message: "Password reset successful" };
    }
    async verifyEmail(token) {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwt.accessTokenSecret);
        if (!decoded.sub) {
            throw new UnauthorizedError_1.UnauthorizedError("Verification token invalid");
        }
        const user = await this.userRepository.findById(decoded.sub);
        if (!user) {
            throw new UnauthorizedError_1.UnauthorizedError("User not found");
        }
        await this.userRepository.update(user.id, { isEmailVerified: true });
        return { message: "Email verified successfully" };
    }
    async refreshToken(token) {
        const existing = await this.refreshTokenRepository.findByToken(token);
        if (!existing || existing.revoked || existing.expiresAt < new Date()) {
            throw new UnauthorizedError_1.UnauthorizedError("Refresh token invalid or expired");
        }
        const user = await this.userRepository.findById(existing.userId);
        if (!user) {
            throw new UnauthorizedError_1.UnauthorizedError("Refresh token owner not found");
        }
        await this.refreshTokenRepository.revoke(existing.id);
        return this.createTokensForUser(user.id);
    }
    async logout(token) {
        await this.refreshTokenRepository.revokeByToken(token);
    }
    signToken(subject, secret, expiresIn) {
        return jsonwebtoken_1.default.sign({ sub: subject }, secret, {
            expiresIn: expiresIn,
        });
    }
    extractGoogleEmail(idToken) {
        const [, payload] = idToken.split(".");
        if (!payload) {
            throw new ValidationError_1.ValidationError("Invalid Google token");
        }
        const decoded = Buffer.from(payload, "base64").toString("utf8");
        const parsed = JSON.parse(decoded);
        if (!parsed.email) {
            throw new ValidationError_1.ValidationError("Google token does not contain an email");
        }
        return parsed.email;
    }
    async sendVerificationEmail(email, token) {
        const link = `${config_1.default.appUrl}/auth/verify-email?token=${token}`;
        await this.emailService.sendMail(email, "Verify your RARS Shield email", `<p>Welcome to RARS Shield.</p><p>Verify your email by clicking <a href="${link}">here</a>.</p>`);
    }
    async sendPasswordResetEmail(email, token) {
        const link = `${config_1.default.appUrl}/auth/reset-password?token=${token}`;
        await this.emailService.sendMail(email, "Reset your RARS Shield password", `<p>Click <a href="${link}">here</a> to reset your password.</p>`);
    }
    async createTokensForUser(userId) {
        const accessToken = this.signToken(userId, config_1.default.jwt.accessTokenSecret, config_1.default.jwt.accessTokenExpiresIn);
        const refreshToken = this.signToken(userId, config_1.default.jwt.refreshTokenSecret, config_1.default.jwt.refreshTokenExpiresIn);
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
exports.AuthService = AuthService;
//# sourceMappingURL=AuthService.js.map