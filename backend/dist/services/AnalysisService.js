"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisService = void 0;
const client_1 = require("@prisma/client");
const AnalysisRepository_1 = require("../repositories/AnalysisRepository");
const aiService_1 = require("./aiService");
const ValidationError_1 = require("../errors/ValidationError");
class AnalysisService {
    repository = new AnalysisRepository_1.AnalysisRepository();
    aiService = new aiService_1.AIService();
    async createAnalysis(userId, payload) {
        const content = payload.content ?? payload.payload;
        if (!content || !payload.type) {
            throw new ValidationError_1.ValidationError("Analysis type and content are required");
        }
        const analysisType = client_1.AnalysisType[payload.type];
        if (!analysisType) {
            throw new ValidationError_1.ValidationError("Invalid analysis type");
        }
        const aiResult = await this.aiService.analyzeRisk({
            type: payload.type,
            content,
        });
        const riskLevel = client_1.RiskLevel[aiResult.riskLevel] ??
            client_1.RiskLevel.MEDIUM;
        return this.repository.create({
            userId,
            type: analysisType,
            payload: { content },
            riskScore: Number(aiResult.riskScore),
            riskLevel,
            explanation: String(aiResult.explanation),
            recommendation: String(aiResult.recommendation),
            confidence: Number(aiResult.confidence),
            meta: payload.meta ?? {},
        });
    }
}
exports.AnalysisService = AnalysisService;
//# sourceMappingURL=AnalysisService.js.map