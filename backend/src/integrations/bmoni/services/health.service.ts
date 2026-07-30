import { BmoniClient } from "../http/bmoni.client";
import { HealthResponse } from "../types/dto";

export class HealthService {
  constructor(private readonly client: BmoniClient = new BmoniClient()) {}

  async getHealth(): Promise<HealthResponse> {
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
