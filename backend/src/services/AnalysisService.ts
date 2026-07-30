import { AnalysisType, RiskLevel } from "@prisma/client";
import { AnalysisRepository } from "../repositories/AnalysisRepository";
import { AIService } from "./aiService";
import { ValidationError } from "../errors/ValidationError";

export class AnalysisService {
  private repository = new AnalysisRepository();
  private aiService = new AIService();

  async createAnalysis(
    userId: string,
    payload: {
      type: string;
      content?: string;
      payload?: string;
      meta?: Record<string, unknown>;
    },
  ) {
    const content = payload.content ?? payload.payload;

    if (!content || !payload.type) {
      throw new ValidationError("Analysis type and content are required");
    }

    const analysisType =
      AnalysisType[payload.type as keyof typeof AnalysisType];
    if (!analysisType) {
      throw new ValidationError("Invalid analysis type");
    }

    const aiResult = await this.aiService.analyzeRisk({
      type: payload.type,
      content,
    });

    const riskLevel =
      RiskLevel[aiResult.riskLevel as keyof typeof RiskLevel] ??
      RiskLevel.MEDIUM;

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
