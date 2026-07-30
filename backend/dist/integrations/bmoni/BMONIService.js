"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BMONIService = void 0;
const BMONIClient_1 = require("./BMONIClient");
const WalletRepository_1 = require("../../repositories/WalletRepository");
const FinancialInsightRepository_1 = require("../../repositories/FinancialInsightRepository");
const UserRepository_1 = require("../../repositories/UserRepository");
const balance_service_1 = require("./services/balance.service");
const health_service_1 = require("./services/health.service");
const FinancialInsightService_1 = require("../../services/FinancialInsightService");
const prisma_1 = require("../../database/prisma");
class BMONIService {
    client = new BMONIClient_1.BMONIClient();
    walletRepository = new WalletRepository_1.WalletRepository();
    financialInsightRepository = new FinancialInsightRepository_1.FinancialInsightRepository();
    userRepository = new UserRepository_1.UserRepository();
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
        const email = input.email || localUser.email;
        const nameParts = (localUser.name || "").trim().split(" ");
        const firstName = input.firstName || nameParts[0] || "User";
        const lastName = input.lastName || nameParts.slice(1).join(" ") || "User";
        const phoneNumber = input.phoneNumber || "+2348000000000";
        const countryCode = input.countryCode || "NG";
        const createdUser = await this.client.createUser({
            email,
            firstName,
            lastName,
            phoneNumber,
            countryCode,
        });
        const bmoniUserId = createdUser.id ||
            createdUser.userId ||
            existingWallet?.bmoniUserId ||
            `usr_${Date.now().toString(36)}`;
        const walletPayload = {
            balance: existingWallet?.balance ? Number(existingWallet.balance) : 0,
            currency: existingWallet?.currency ?? "USD",
            provider: "BMONI",
            status: existingWallet?.status ?? "ACTIVE",
            bmoniUserId,
            metadata: {
                source: "local-onboarding",
                email,
            },
        };
        await this.walletRepository.upsertForUser(userId, walletPayload);
        let smartWallet;
        let smartWalletId = existingWallet?.smartWalletId || null;
        if (input.createSmartWallet !== false && bmoniUserId) {
            const swResp = await this.client.createManagedSmartWallet(bmoniUserId, {
                currency: input.currency ?? "USD",
                ownerAddress: input.ownerAddress,
            });
            smartWalletId =
                swResp.smartWalletId ||
                    swResp.id ||
                    swResp.address ||
                    swResp.smartWalletAddress ||
                    smartWalletId;
            if (smartWalletId) {
                await this.walletRepository.upsertForUser(userId, {
                    ...walletPayload,
                    smartWalletId: String(smartWalletId),
                });
            }
            smartWallet = {
                id: swResp.id,
                smartWalletId,
            };
        }
        const updatedWallet = await this.walletRepository.findByUserId(userId);
        return {
            success: true,
            bmoniUserId: updatedWallet?.bmoniUserId || bmoniUserId,
            smartWalletId: updatedWallet?.smartWalletId || smartWalletId,
            smartWallet,
            wallet: updatedWallet,
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
    async createOwnerProofChallenge(userId, input = {}) {
        return this.client.createOwnerProofChallenge(userId, input);
    }
    async getOnboardingStatus(userId) {
        return this.client.getOnboardingStatus(userId);
    }
    async startNigeriaOnboarding(userId, input = {}) {
        return this.client.startNigeriaOnboarding(userId, input);
    }
    async getWallets(userId) {
        return this.client.getWallets(userId);
    }
    async getTransactions(userId) {
        return this.client.getTransactions(userId);
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