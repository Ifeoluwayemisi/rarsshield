"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BMONIClient = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../../config"));
const logger_1 = require("../../utils/logger");
class BMONIClient {
    http;
    constructor() {
        const baseURL = config_1.default.bmoni.baseUrl ||
            process.env.BMONI_API_BASE_URL ||
            process.env.BMONI_BASE_URL ||
            "https://embedded-dev.bmoni.com";
        const apiKey = config_1.default.bmoni.apiKey ||
            process.env.BMONI_API_KEY ||
            "pk_a025cacbf33a_76fb864113f3540909de5b1da39cc146906e35b1c6d4d1e4";
        this.http = axios_1.default.create({
            baseURL,
            headers: {
                "x-api-key": apiKey,
                "Content-Type": "application/json",
            },
            timeout: 10_000,
        });
    }
    async getInfo() {
        try {
            const resp = await this.http.get("/v1/health");
            const data = resp.data ?? {};
            return {
                provider: "BMONI",
                status: data.status || "ok",
                version: data.version,
                baseUrl: this.http.defaults?.baseURL ??
                    process.env.BMONI_API_BASE_URL ??
                    "https://embedded-dev.bmoni.com",
                connected: true,
            };
        }
        catch (err) {
            return {
                provider: "BMONI",
                status: "unreachable",
                baseUrl: this.http.defaults?.baseURL ??
                    process.env.BMONI_API_BASE_URL ??
                    "https://embedded-dev.bmoni.com",
                connected: false,
            };
        }
    }
    async createUser(input) {
        try {
            const resp = await this.http.post("/v1/users", input);
            const data = resp.data?.data || resp.data || {};
            const id = data.id ||
                data.userId ||
                data.user_id ||
                data.bmoniUserId ||
                `bmoni_usr_${Date.now()}`;
            return {
                ...data,
                id,
            };
        }
        catch (error) {
            logger_1.logger.error({
                error: error?.response?.data || error?.message,
                status: error?.response?.status,
            }, "BMONI createUser API error");
            const fallbackId = `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
            return {
                id: fallbackId,
                email: input.email,
                firstName: input.firstName,
                lastName: input.lastName,
                phoneNumber: input.phoneNumber,
                countryCode: input.countryCode,
                _error: error?.response?.data || error?.message,
            };
        }
    }
    async createManagedSmartWallet(userId, input = {}) {
        try {
            const resp = await this.http.post(`/v1/users/${encodeURIComponent(userId)}/smart-wallets/create-managed`, input);
            const data = resp.data?.data || resp.data || {};
            const smartWalletId = data.smartWalletId ||
                data.id ||
                data.address ||
                data.smartWalletAddress ||
                `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`;
            return {
                ...data,
                id: data.id || smartWalletId,
                smartWalletId,
            };
        }
        catch (error) {
            logger_1.logger.error({
                error: error?.response?.data || error?.message,
                status: error?.response?.status,
            }, "BMONI createManagedSmartWallet API error");
            const fallbackWalletId = `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`;
            return {
                id: fallbackWalletId,
                smartWalletId: fallbackWalletId,
                _error: error?.response?.data || error?.message,
            };
        }
    }
    async createOwnerProofChallenge(userId, input = {}) {
        try {
            const resp = await this.http.post(`/v1/users/${encodeURIComponent(userId)}/smart-wallets/owner-proof-challenges`, input);
            return resp.data?.data || resp.data || {};
        }
        catch (error) {
            logger_1.logger.error({
                error: error?.response?.data || error?.message,
                status: error?.response?.status,
            }, "BMONI ownerProofChallenge API error");
            return { _error: error?.response?.data || error?.message };
        }
    }
    async getOnboardingStatus(userId) {
        try {
            const resp = await this.http.get(`/v1/users/${encodeURIComponent(userId)}/onboarding/status`);
            return resp.data?.data || resp.data || {};
        }
        catch (error) {
            logger_1.logger.error({
                error: error?.response?.data || error?.message,
                status: error?.response?.status,
            }, "BMONI onboardingStatus API error");
            return {
                status: "UNKNOWN",
                _error: error?.response?.data || error?.message,
            };
        }
    }
    async startNigeriaOnboarding(userId, input = {}) {
        try {
            const resp = await this.http.post(`/v1/users/${encodeURIComponent(userId)}/onboarding/start-nigeria`, input);
            return resp.data?.data || resp.data || {};
        }
        catch (error) {
            logger_1.logger.error({
                error: error?.response?.data || error?.message,
                status: error?.response?.status,
            }, "BMONI startNigeriaOnboarding API error");
            return {
                status: "FAILED",
                _error: error?.response?.data || error?.message,
            };
        }
    }
    async getWallets(userId) {
        try {
            const resp = await this.http.get(`/v1/users/${encodeURIComponent(userId)}/smart-wallets/account/wallets`);
            return resp.data?.data || resp.data || [];
        }
        catch (error) {
            logger_1.logger.error({
                error: error?.response?.data || error?.message,
                status: error?.response?.status,
            }, "BMONI walletList API error");
            return [];
        }
    }
    /**
     * Returns a simple account summary by calling the group balances endpoint
     */
    async getAccountSummary(userId) {
        try {
            const resp = await this.http.get(`/v1/users/${encodeURIComponent(userId)}/smart-wallets/account/balances`);
            const data = resp.data ?? [];
            // Response is an array of balances per smart wallet; pick the first entry as a summary
            const first = Array.isArray(data) && data.length ? data[0] : null;
            if (first) {
                return {
                    accountId: first.smartWalletId || `bmoni-${userId}`,
                    balance: Number(first.balance ?? 0),
                    currency: first.currency || first.currencyCode || "USD",
                    status: first.status || "ACTIVE",
                    riskScore: typeof first.riskScore === "number" ? first.riskScore : undefined,
                };
            }
            // Fallback empty summary
            return {
                accountId: `bmoni-${userId}`,
                balance: 0,
                currency: "USD",
                status: "UNKNOWN",
            };
        }
        catch (err) {
            return {
                accountId: `bmoni-${userId}`,
                balance: 0,
                currency: "USD",
                status: "ERROR",
            };
        }
    }
    async getTransactions(userId) {
        try {
            const resp = await this.http.get(`/v1/users/${encodeURIComponent(userId)}/smart-wallets/account/transactions`);
            return resp.data?.data || resp.data || [];
        }
        catch (error) {
            logger_1.logger.error({
                error: error?.response?.data || error?.message,
                status: error?.response?.status,
            }, "BMONI transactions API error");
            return [];
        }
    }
    /**
     * Insights are not provided as a dedicated upstream endpoint in this spec snapshot.
     * Return an empty array for now; we can implement derived insights later using
     * transactions or analytics endpoints.
     */
    async getInsights(_userId) {
        return [];
    }
}
exports.BMONIClient = BMONIClient;
//# sourceMappingURL=BMONIClient.js.map