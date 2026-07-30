import { prisma } from "../database/prisma";
import { Analysis, AnalysisType, RiskLevel } from "@prisma/client";

function toJsonValue(value: Record<string, unknown>) {
  return value as any;
}

export class AnalysisRepository {
  async create(data: {
    userId: string;
    type: AnalysisType;
    payload: Record<string, unknown>;
    riskScore: number;
    riskLevel: RiskLevel;
    explanation: string;
    recommendation: string;
    confidence: number;
    meta?: Record<string, unknown>;
  }): Promise<Analysis> {
    return prisma.analysis.create({
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
