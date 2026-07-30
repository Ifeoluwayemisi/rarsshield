"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BmoniClient = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../../../config"));
class BmoniClient {
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