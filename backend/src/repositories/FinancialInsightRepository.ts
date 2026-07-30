import { prisma } from "../database/prisma";

export class FinancialInsightRepository {
  async listByUser(userId: string) {
    return prisma.financialInsight.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async replaceForUser(
    userId: string,
    insights: Array<{
      id: string;
      category: string;
      title: string;
      summary: string;
      score: number;
      severity: string;
    }>,
  ) {
    await prisma.financialInsight.deleteMany({ where: { userId } });

    return prisma.financialInsight.createMany({
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
