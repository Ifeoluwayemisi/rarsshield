"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BmoniClient = void 0;
const axios_1 = __importDefault(require("axios"));
class BmoniClient {
    http;
    constructor() {
        const baseURL = process.env.BMONI_API_BASE_URL || "https://embedded-dev.bmoni.com";
        const apiKey = process.env.BMONI_API_KEY || "";
        this.http = axios_1.default.create({
            baseURL,
            headers: {
                "x-api-key": apiKey,
                "Content-Type": "application/json",
            },
            timeout: 10_000,
        });
    }
    async getHealth() {
        try {
            const response = await this.http.get("/v1/health");
            return response.data;
        }
        catch (error) {
            return {
                provider: "BMONI",
                status: "unreachable",
                connected: false,
                baseUrl: this.http.defaults.baseURL,
            };
        }
    }
    async createUser(input) {
        try {
            const response = await this.http.post("/v1/users", input);
            return response.data;
        }
        catch (error) {
            return { id: "", _error: error };
        }
    }
    async createManagedSmartWallet(userId, input = {}) {
        try {
            const response = await this.http.post(`/v1/users/${encodeURIComponent(userId)}/smart-wallets/create-managed`, input);
            return response.data;
        }
        catch (error) {
            return { id: "", _error: error };
        }
    }
    async getAccountSummary(userId) {
        try {
            const response = await this.http.get(`/v1/users/${encodeURIComponent(userId)}/smart-wallets/account/balances`);
            return response.data;
        }
        catch (error) {
            return [];
        }
    }
    async getTransactions(userId) {
        try {
            const response = await this.http.get(`/v1/users/${encodeURIComponent(userId)}/transactions`);
            return response.data;
        }
        catch (error) {
            return [];
        }
    }
}
exports.BmoniClient = BmoniClient;
//# sourceMappingURL=bmoni.client.js.map