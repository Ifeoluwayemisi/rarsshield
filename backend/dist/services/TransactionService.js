"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = void 0;
const TransactionRepository_1 = require("../repositories/TransactionRepository");
const BMONIProvider_1 = require("./BMONIProvider");
class TransactionService {
    transactionRepository = new TransactionRepository_1.TransactionRepository();
    paymentProvider = new BMONIProvider_1.BMONIProvider();
    async createTransaction(userId, payload) {
        const providerResult = await this.paymentProvider.transfer({
            userId,
            amount: payload.amount,
            currency: payload.currency ?? "USD",
            beneficiary: payload.beneficiary,
            reference: `tx-${Date.now()}`,
        });
        return this.transactionRepository.create({
            userId,
            amount: payload.amount,
            currency: payload.currency ?? "USD",
            beneficiary: payload.beneficiary,
            description: payload.description,
            providerReference: providerResult.providerReference,
            status: providerResult.status,
        });
    }
    async getBalance(userId) {
        return this.paymentProvider.getBalance(userId);
    }
    async getHistory(userId) {
        return this.paymentProvider.transactionHistory(userId);
    }
}
exports.TransactionService = TransactionService;
//# sourceMappingURL=TransactionService.js.map