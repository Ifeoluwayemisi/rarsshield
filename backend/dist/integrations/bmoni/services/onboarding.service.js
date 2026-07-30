"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnboardingService = void 0;
const bmoni_client_1 = require("../http/bmoni.client");
const bmoni_wallet_mapper_1 = require("../mappers/bmoni-wallet.mapper");
const bmoni_wallet_repository_1 = require("../repositories/bmoni-wallet.repository");
const not_implemented_error_1 = require("../errors/not-implemented.error");
class OnboardingService {
    client;
    walletRepository;
    constructor(client = new bmoni_client_1.BmoniClient(), walletRepository = new bmoni_wallet_repository_1.BmoniWalletRepository()) {
        this.client = client;
        this.walletRepository = walletRepository;
    }
    async createUser(input) {
        const response = await this.client.createUser(input);
        return {
            id: typeof response.id === "string" ? response.id : "",
            email: input.email,
        };
    }
    async createWallet(userId, input = {}) {
        const response = await this.client.createManagedSmartWallet(userId, input);
        return bmoni_wallet_mapper_1.BmoniWalletMapper.toDto({
            id: typeof response.id === "string" ? response.id : undefined,
            balance: 0,
            currency: input.currency ?? "USD",
            status: "PENDING",
            smartWalletId: typeof response.smartWalletId === "string"
                ? response.smartWalletId
                : undefined,
        });
    }
    async getWalletSummary(userId) {
        return this.walletRepository.getWalletSummary(userId);
    }
    async completeKyc() {
        throw new not_implemented_error_1.NotImplementedError("Sandbox KYC completion");
    }
    async activateNigeriaRail() {
        throw new not_implemented_error_1.NotImplementedError("Nigeria Rail activation");
    }
}
exports.OnboardingService = OnboardingService;
//# sourceMappingURL=onboarding.service.js.map