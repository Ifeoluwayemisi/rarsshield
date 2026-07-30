"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const openai_1 = __importDefault(require("openai"));
const config_1 = __importDefault(require("../config"));
class AIService {
    client;
    constructor() {
        this.client = new openai_1.default({ apiKey: config_1.default.openai.apiKey });
    }
    async analyzeRisk(payload) {
        const prompt = `Analyze the following financial content and return valid JSON only with keys: riskScore, riskLevel, explanation, recommendation, confidence. Content: ${payload.content}`;
        try {
            const completion = await this.client.responses.create({
                model: config_1.default.openai.model,
                input: prompt,
                temperature: 0.2,
            });
            const rawOutput = this.extractTextFromResponse(completion);
            const sanitized = rawOutput.trim();
            try {
                const parsed = JSON.parse(sanitized);
                return parsed;
            }
            catch (error) {
                throw new Error("AI output was not valid JSON");
            }
        }
        catch (error) {
            return this.fallbackAnalysis(payload.content);
        }
    }
    fallbackAnalysis(content) {
        const lowerContent = content.toLowerCase();
        const mentionsMoney = lowerContent.includes("money") ||
            lowerContent.includes("send") ||
            lowerContent.includes("transfer");
        const mentionsUrgency = lowerContent.includes("urgent") ||
            lowerContent.includes("immediately") ||
            lowerContent.includes("today");
        const riskScore = mentionsMoney && mentionsUrgency ? 84 : mentionsMoney ? 68 : 42;
        const riskLevel = riskScore >= 80 ? "HIGH" : riskScore >= 60 ? "MEDIUM" : "LOW";
        return {
            riskScore,
            riskLevel,
            explanation: "The message uses pressure tactics and financial urgency. The platform flagged it as a likely scam pattern using the built-in heuristic fallback.",
            recommendation: "Do not send money or share credentials. Verify the request through an official channel before acting.",
            confidence: 0.74,
        };
    }
    extractTextFromResponse(completion) {
        const outputItems = completion.output ?? [];
        for (const item of outputItems) {
            const outputContent = item.content ?? [];
            for (const content of outputContent) {
                if (content && typeof content.text === "string") {
                    return content.text;
                }
            }
        }
        return "";
    }
}
exports.AIService = AIService;
//# sourceMappingURL=aiService.js.map