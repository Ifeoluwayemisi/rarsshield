"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BMONIService = void 0;
const BMONIClient_1 = require("./BMONIClient");
const WalletRepository_1 = require("../../repositories/WalletRepository");
const FinancialInsightRepository_1 = require("../../repositories/FinancialInsightRepository");
const UserRepository_1 = require("../../repositories/UserRepository");
const onboarding_service_1 = require("./services/onboarding.service");
const balance_service_1 = require("./services/balance.service");
const health_service_1 = require("./services/health.service");
const FinancialInsightService_1 = require("../../services/FinancialInsightService");
const prisma_1 = require("../../database/prisma");
class BMONIService {
    client = new BMONIClient_1.BMONIClient();
    walletRepository = new WalletRepository_1.WalletRepository();
    financialInsightRepository = new FinancialInsightRepository_1.FinancialInsightRepository();
    userRepository = new UserRepository_1.UserRepository();
    onboardingService = new onboarding_service_1.OnboardingService(this.client);
    balanceService = new balance_service_1.BalanceService(this.client);
    healthService = new health_service_1.HealthService(this.client);
    financialInsightService = new FinancialInsightService_1.FinancialInsightService();
    async getInfo() {
        return this.healthService.getHealth();
    }
    async onboardUser(userId, input = {}) {
        const localUser = await this.userRepository.findById(userId);
        if (!localUser) {
            throw new Error("Local user not found");
        }
        const existingWallet = await this.walletRepository.findByUserId(userId);
        const email = input.email ?? localUser.email;
        const firstName = input.firstName ?? localUser.name?.split(" ")[0] ?? "";
        const lastName = input.lastName ?? localUser.name?.split(" ").slice(1).join(" ") ?? "";
        const createdUser = await this.onboardingService.createUser({
            email,
            firstName,
            lastName,
            phoneNumber: input.phoneNumber,
            countryCode: input.countryCode,
        });
        const walletPayload = {
            balance: existingWallet?.balance ? Number(existingWallet.balance) : 0,
            currency: existingWallet?.currency ?? "USD",
            provider: "BMONI",
            status: existingWallet?.status ?? "ACTIVE",
            bmoniUserId: createdUser.id || existingWallet?.bmoniUserId || null,
            metadata: {
                source: "local-onboarding",
                email,
            },
        };
        await this.walletRepository.upsertForUser(userId, walletPayload);
        let smartWallet;
        if (input.createSmartWallet !== false && createdUser.id) {
            smartWallet = await this.onboardingService.createWallet(createdUser.id, {
                currency: input.currency ?? "USD",
                ownerAddress: input.ownerAddress,
            });
            if (smartWallet.id || smartWallet.smartWalletId) {
                await this.walletRepository.upsertForUser(userId, {
                    ...walletPayload,
                    smartWalletId: String(smartWallet.id ?? smartWallet.smartWalletId ?? ""),
                });
            }
        }
        return {
            success: true,
            bmoniUserId: createdUser.id || null,
            smartWallet,
            wallet: await this.walletRepository.findByUserId(userId),
        };
    }
    async syncWallet(userId) {
        const summary = await this.balanceService.getBalance(userId);
        return this.walletRepository.upsertForUser(userId, {
            balance: summary.balance,
            currency: summary.currency,
            provider: "BMONI",
            status: summary.status,
        });
    }
    async getWallet(userId) {
        return this.walletRepository.findByUserId(userId);
    }
    async syncInsights(userId) {
        const wallet = await this.walletRepository.findByUserId(userId);
        const transactions = await prisma_1.prisma.transaction.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 10,
        });
        const insights = this.financialInsightService.buildInsights(wallet, transactions);
        await this.financialInsightRepository.replaceForUser(userId, insights);
        return this.financialInsightRepository.listByUser(userId);
    }
    async getInsights(userId) {
        return this.financialInsightRepository.listByUser(userId);
    }
}
exports.BMONIService = BMONIService;
//# sourceMappingURL=BMONIService.js.map