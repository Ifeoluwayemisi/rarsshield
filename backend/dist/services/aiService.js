"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1";
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY || "";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.1";
class AIService {
    async analyzeRisk(payload) {
        try {
            const res = await fetch(`${OLLAMA_BASE_URL.replace(/\/$/, "")}/chat/completions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(OLLAMA_API_KEY ? { Authorization: `Bearer ${OLLAMA_API_KEY}` } : {}),
                },
                body: JSON.stringify({
                    model: OLLAMA_MODEL,
                    messages: [
                        {
                            role: "system",
                            content: "You are a financial scam detection assistant. Return valid JSON with keys: riskScore, riskLevel, explanation, recommendation, confidence.",
                        },
                        {
                            role: "user",
                            content: `Analyze this message for scam risk. Message type: ${payload.type || "Unknown"}. Content: ${payload.content}`,
                        },
                    ],
                    temperature: 0.2,
                }),
            });
            if (!res.ok)
                throw new Error(`AI engine responded ${res.status}`);
            const result = (await res.json());
            const content = result.choices?.[0]?.message?.content;
            if (typeof content !== "string") {
                throw new Error("AI engine returned no content");
            }
            const parsed = this.parseJsonContent(content);
            return this.normalizeResponse(parsed);
        }
        catch (error) {
            return this.fallbackAnalysis(payload.content);
        }
    }
    parseJsonContent(content) {
        const trimmed = content.trim();
        try {
            return JSON.parse(trimmed);
        }
        catch {
            const match = trimmed.match(/\{[\s\S]*\}/);
            if (!match) {
                throw new Error("AI output was not valid JSON");
            }
            return JSON.parse(match[0]);
        }
    }
    normalizeResponse(result) {
        const normalizedRiskLevel = typeof result.riskLevel === "string" && result.riskLevel.trim()
            ? result.riskLevel.toUpperCase()
            : "LOW";
        return {
            riskScore: result.riskScore ?? 0,
            riskLevel: normalizedRiskLevel,
            explanation: result.explanation ?? "No explanation provided by the AI engine.",
            recommendation: result.recommendation ??
                "Do not send money or share credentials. Verify the request through an official channel before acting.",
            confidence: typeof result.confidence === "number" ? result.confidence : 0,
        };
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
}
exports.AIService = AIService;
//# sourceMappingURL=aiService.js.map