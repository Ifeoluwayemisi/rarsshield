"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionRepository = void 0;
const prisma_1 = require("../database/prisma");
class TransactionRepository {
    async create(data) {
        return prisma_1.prisma.transaction.create({ data });
    }
}
exports.TransactionRepository = TransactionRepository;
//# sourceMappingURL=TransactionRepository.js.map