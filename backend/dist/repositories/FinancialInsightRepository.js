"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialInsightRepository = void 0;
const prisma_1 = require("../database/prisma");
class FinancialInsightRepository {
    async listByUser(userId) {
        return prisma_1.prisma.financialInsight.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    }
    async replaceForUser(userId, insights) {
        await prisma_1.prisma.financialInsight.deleteMany({ where: { userId } });
        return prisma_1.prisma.financialInsight.createMany({
            data: insights.map((insight) => ({
                userId,
                category: insight.category,
                title: insight.title,
                summary: insight.summary,
                score: insight.score,
                severity: insight.severity,
                metadata: { source: "BMONI", externalId: insight.id },
            })),
        });
    }
}
exports.FinancialInsightRepository = FinancialInsightRepository;
//# sourceMappingURL=FinancialInsightRepository.js.map