"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = void 0;
const bmoni_wallet_repository_1 = require("../repositories/bmoni-wallet.repository");
class TransactionService {
    walletRepository;
    constructor(walletRepository = new bmoni_wallet_repository_1.BmoniWalletRepository()) {
        this.walletRepository = walletRepository;
    }
    async getTransactions(userId) {
        return this.walletRepository.getTransactions(userId);
    }
}
exports.TransactionService = TransactionService;
//# sourceMappingURL=transaction.service.js.map