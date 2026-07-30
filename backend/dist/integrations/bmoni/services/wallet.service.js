"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const balance_service_1 = require("./balance.service");
const onboarding_service_1 = require("./onboarding.service");
const transaction_service_1 = require("./transaction.service");
const health_service_1 = require("./health.service");
class WalletService {
    onboardingService;
    balanceService;
    transactionService;
    healthService;
    constructor(onboardingService = new onboarding_service_1.OnboardingService(), balanceService = new balance_service_1.BalanceService(), transactionService = new transaction_service_1.TransactionService(), healthService = new health_service_1.HealthService()) {
        this.onboardingService = onboardingService;
        this.balanceService = balanceService;
        this.transactionService = transactionService;
        this.healthService = healthService;
    }
    async getHealth() {
        return this.healthService.getHealth();
    }
    async createUser(input) {
        return this.onboardingService.createUser(input);
    }
    async createWallet(userId, input = {}) {
        return this.onboardingService.createWallet(userId, input);
    }
    async getWalletSummary(userId) {
        return this.onboardingService.getWalletSummary(userId);
    }
    async getBalance(userId) {
        return this.balanceService.getBalance(userId);
    }
    async getTransactions(userId) {
        return this.transactionService.getTransactions(userId);
    }
}
exports.WalletService = WalletService;
//# sourceMappingURL=wallet.service.js.map