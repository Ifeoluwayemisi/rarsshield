"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockPaymentProvider = void 0;
const client_1 = require("@prisma/client");
class MockPaymentProvider {
    async createWallet(userId) {
        return { walletId: `mock-wallet-${userId}`, balance: 1000.0 };
    }
    async verifyAccount(accountNumber, bankCode) {
        return {
            valid: accountNumber.length === 10 && bankCode.length > 0,
            accountName: "Mock Account",
        };
    }
    async transfer(params) {
        return {
            providerReference: `mock-tx-${params.reference}`,
            status: params.amount > 0
                ? client_1.TransactionStatus.COMPLETED
                : client_1.TransactionStatus.FAILED,
        };
    }
    async getBalance(_userId) {
        return { balance: 1000.0, currency: "USD" };
    }
    async transactionHistory(userId, limit = 20) {
        return Array.from({ length: Math.min(limit, 5) }, (_, index) => ({
            providerReference: `mock-tx-${userId}-${index}`,
            amount: 100 + index * 10,
            currency: "USD",
            status: client_1.TransactionStatus.COMPLETED,
            createdAt: new Date().toISOString(),
        }));
    }
    async verifyTransaction(_providerReference) {
        return { verified: true, status: client_1.TransactionStatus.COMPLETED };
    }
    async createBeneficiary(userId, beneficiary) {
        return {
            beneficiaryId: `mock-beneficiary-${userId}-${beneficiary.accountNumber}`,
            verified: true,
        };
    }
    async reverseTransaction(providerReference) {
        return { providerReference, status: client_1.TransactionStatus.REVERSED };
    }
}
exports.MockPaymentProvider = MockPaymentProvider;
//# sourceMappingURL=MockPaymentProvider.js.map