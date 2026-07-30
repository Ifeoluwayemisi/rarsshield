"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisRepository = void 0;
const prisma_1 = require("../database/prisma");
function toJsonValue(value) {
    return value;
}
class AnalysisRepository {
    async create(data) {
        return prisma_1.prisma.analysis.create({
            data: {
                userId: data.userId,
                type: data.type,
                payload: toJsonValue(data.payload),
                riskScore: data.riskScore,
                riskLevel: data.riskLevel,
                explanation: data.explanation,
                recommendation: data.recommendation,
                confidence: data.confidence,
                meta: data.meta ? toJsonValue(data.meta) : undefined,
            },
        });
    }
}
exports.AnalysisRepository = AnalysisRepository;
//# sourceMappingURL=AnalysisRepository.js.map