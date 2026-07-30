"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthService = void 0;
const bmoni_client_1 = require("../http/bmoni.client");
class HealthService {
    client;
    constructor(client = new bmoni_client_1.BmoniClient()) {
        this.client = client;
    }
    async getHealth() {
        const response = await this.client.getHealth();
        return {
            provider: "BMONI",
            status: response.status || "ok",
            connected: response.connected !== false,
            baseUrl: response.baseUrl,
            version: response.version,
        };
    }
}
exports.HealthService = HealthService;
//# sourceMappingURL=health.service.js.map