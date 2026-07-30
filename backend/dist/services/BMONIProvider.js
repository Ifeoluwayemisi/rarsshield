"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BMONIProvider = void 0;
const client_1 = require("@prisma/client");
const BMONIService_1 = require("../integrations/bmoni/BMONIService");
class BMONIProvider {
    bmoniService = new BMONIService_1.BMONIService();
    async createWallet(userId) {
        const wallet = await this.bmoniService.syncWallet(userId);
        return { walletId: wallet.id, balance: Number(wallet.balance) };
    }
    async verifyAccount(accountNumber, bankCode) {
        return {
            valid: accountNumber.length === 10 && bankCode.length > 0,
            accountName: "BMONI Verified Account",
        };
    }
    async transfer(params) {
        await this.bmoniService.syncWallet(params.userId);
        return {
            providerReference: `bmoni-${params.reference}`,
            status: params.amount > 0
                ? client_1.TransactionStatus.COMPLETED
                : client_1.TransactionStatus.FAILED,
        };
    }
    async getBalance(userId) {
        const wallet = await this.bmoniService.getWallet(userId);
        return {
            balance: wallet ? Number(wallet.balance) : 0,
            currency: wallet?.currency ?? "USD",
        };
    }
    async transactionHistory(userId, limit = 20) {
        const wallet = await this.bmoniService.getWallet(userId);
        return [
            {
                providerReference: `bmoni-${userId}`,
                amount: wallet ? Number(wallet.balance) : 0,
                currency: wallet?.currency ?? "USD",
                status: client_1.TransactionStatus.COMPLETED,
                createdAt: new Date().toISOString(),
            },
        ].slice(0, Math.min(limit, 5));
    }
    async verifyTransaction(providerReference) {
        return {
            verified: true,
            status: client_1.TransactionStatus.COMPLETED,
            providerReference,
        };
    }
    async createBeneficiary(userId, beneficiary) {
        return {
            beneficiaryId: `bmoni-beneficiary-${userId}-${beneficiary.accountNumber}`,
            verified: true,
        };
    }
    async reverseTransaction(providerReference) {
        return { providerReference, status: client_1.TransactionStatus.REVERSED };
    }
}
exports.BMONIProvider = BMONIProvider;
//# sourceMappingURL=BMONIProvider.js.map