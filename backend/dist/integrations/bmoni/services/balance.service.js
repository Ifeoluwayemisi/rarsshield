"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalanceService = void 0;
const bmoni_wallet_repository_1 = require("../repositories/bmoni-wallet.repository");
class BalanceService {
    walletRepository;
    constructor(walletRepository = new bmoni_wallet_repository_1.BmoniWalletRepository()) {
        this.walletRepository = walletRepository;
    }
    async getBalance(userId) {
        return this.walletRepository.getBalance(userId);
    }
}
exports.BalanceService = BalanceService;
//# sourceMappingURL=balance.service.js.map