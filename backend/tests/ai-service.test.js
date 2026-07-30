describe("AIService", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    global.fetch = jest.fn();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("uses the Ollama-compatible chat endpoint and maps the response to the app schema", async () => {
    process.env.OLLAMA_BASE_URL = "https://example.com/v1";
    process.env.OLLAMA_API_KEY = "test-key";
    process.env.OLLAMA_MODEL = "nemotron-3-ultra";

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content:
                '{"riskScore":86,"riskLevel":"HIGH","explanation":"Urgent payment request","recommendation":"Do not proceed","confidence":0.92}',
            },
          },
        ],
      }),
    });

    const { AIService } = require("../dist/services/aiService.js");
    const service = new AIService();
    const result = await service.analyzeRisk({
      type: "SMS",
      content: "Please send money now",
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "https://example.com/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-key",
          "Content-Type": "application/json",
        }),
      }),
    );

    expect(result).toEqual(
      expect.objectContaining({
        riskScore: 86,
        riskLevel: "HIGH",
        explanation: "Urgent payment request",
        recommendation: "Do not proceed",
        confidence: 0.92,
      }),
    );
  });
});
