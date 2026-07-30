const { AnalysisService } = require("../dist/services/AnalysisService");

describe("AnalysisService payload compatibility", () => {
  it("accepts a payload field and maps it to analysis content", async () => {
    const service = new AnalysisService();
    service.aiService = {
      analyzeRisk: async () => ({
        riskScore: 82,
        riskLevel: "HIGH",
        explanation: "High risk",
        recommendation: "Stop and verify",
        confidence: 0.91,
      }),
    };

    service.repository = {
      create: async (data) => data,
    };

    const result = await service.createAnalysis("user-1", {
      type: "TEXT",
      payload: "The message asks me to send money",
    });

    expect(result.payload).toEqual({
      content: "The message asks me to send money",
    });
  });
});
