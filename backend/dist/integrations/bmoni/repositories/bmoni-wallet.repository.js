"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BmoniWalletRepository = void 0;
const bmoni_client_1 = require("../http/bmoni.client");
const bmoni_wallet_mapper_1 = require("../mappers/bmoni-wallet.mapper");
class BmoniWalletRepository {
    client;
    constructor(client = new bmoni_client_1.BmoniClient()) {
        this.client = client;
    }
    async getWalletSummary(userId) {
        const response = await this.client.getAccountSummary(userId);
        const payload = Array.isArray(response) && response.length ? response[0] : {};
        return bmoni_wallet_mapper_1.BmoniWalletMapper.toDto(payload);
    }
    async getBalance(userId) {
        const wallet = await this.getWalletSummary(userId);
        return {
            balance: wallet.balance,
            currency: wallet.currency,
            status: wallet.status,
        };
    }
    async getTransactions(userId) {
        const response = await this.client.getTransactions(userId);
        const items = Array.isArray(response) ? response : [];
        return items.map((item) => ({
            id: typeof item.id === "string" ? item.id : "",
            amount: Number(item.amount ?? 0),
            currency: typeof item.currency === "string" ? item.currency : "USD",
            status: typeof item.status === "string" ? item.status : "UNKNOWN",
            description: typeof item.description === "string" ? item.description : undefined,
        }));
    }
}
exports.BmoniWalletRepository = BmoniWalletRepository;
//# sourceMappingURL=bmoni-wallet.repository.js.map