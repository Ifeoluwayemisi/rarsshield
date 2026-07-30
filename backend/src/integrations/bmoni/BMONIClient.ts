import axios, { AxiosInstance } from "axios";

export interface BMONIAccountSummary {
  accountId: string;
  balance: number;
  currency: string;
  status: string;
  riskScore?: number;
}

export interface BMONIInsight {
  id: string;
  category: string;
  title: string;
  summary: string;
  score: number;
  severity: string;
}

export interface BMONIInfo {
  provider: string;
  status: string;
  version?: string;
  baseUrl?: string;
  connected: boolean;
}

export interface BMONICreateUserInput {
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  countryCode?: string;
  [key: string]: unknown;
}

export interface BMONICreateUserResponse {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  countryCode?: string;
  [key: string]: unknown;
}

export interface BMONICreateManagedWalletInput {
  currency?: string;
  ownerAddress?: string;
  [key: string]: unknown;
}

export interface BMONICreateManagedWalletResponse {
  id?: string;
  smartWalletId?: string;
  [key: string]: unknown;
}

export class BMONIClient {
  private http: AxiosInstance;

  constructor() {
    const baseURL =
      process.env.BMONI_API_BASE_URL || "https://embedded-dev.bmoni.com";
    const apiKey = process.env.BMONI_API_KEY || "";

    this.http = axios.create({
      baseURL,
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      timeout: 10_000,
    });
  }

  async getInfo(): Promise<BMONIInfo> {
    try {
      const resp = await this.http.get("/v1/health");
      const data = resp.data ?? {};
      return {
        provider: "BMONI",
        status: data.status || "ok",
        version: data.version,
        baseUrl:
          this.http.defaults?.baseURL ??
          process.env.BMONI_API_BASE_URL ??
          "https://embedded-dev.bmoni.com",
        connected: true,
      };
    } catch (err) {
      return {
        provider: "BMONI",
        status: "unreachable",
        baseUrl:
          this.http.defaults?.baseURL ??
          process.env.BMONI_API_BASE_URL ??
          "https://embedded-dev.bmoni.com",
        connected: false,
      };
    }
  }

  async createUser(
    input: BMONICreateUserInput,
  ): Promise<BMONICreateUserResponse> {
    try {
      const resp = await this.http.post("/v1/users", input);
      return resp.data as BMONICreateUserResponse;
    } catch (error) {
      return {
        id: "",
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        phoneNumber: input.phoneNumber,
        countryCode: input.countryCode,
        _error: error,
      };
    }
  }

  async createManagedSmartWallet(
    userId: string,
    input: BMONICreateManagedWalletInput = {},
  ): Promise<BMONICreateManagedWalletResponse> {
    try {
      const resp = await this.http.post(
        `/v1/users/${encodeURIComponent(userId)}/smart-wallets/create-managed`,
        input,
      );
      return resp.data as BMONICreateManagedWalletResponse;
    } catch (error) {
      return {
        id: "",
        _error: error,
      };
    }
  }

  /**
   * Returns a simple account summary by calling the group balances endpoint
   */
  async getAccountSummary(userId: string): Promise<BMONIAccountSummary> {
    try {
      const resp = await this.http.get(
        `/v1/users/${encodeURIComponent(userId)}/smart-wallets/account/balances`,
      );
      const data = resp.data ?? [];

      // Response is an array of balances per smart wallet; pick the first entry as a summary
      const first = Array.isArray(data) && data.length ? data[0] : null;

      if (first) {
        return {
          accountId: first.smartWalletId || `bmoni-${userId}`,
          balance: Number(first.balance ?? 0),
          currency: first.currency || first.currencyCode || "USD",
          status: first.status || "ACTIVE",
          riskScore:
            typeof first.riskScore === "number" ? first.riskScore : undefined,
        };
      }

      // Fallback empty summary
      return {
        accountId: `bmoni-${userId}`,
        balance: 0,
        currency: "USD",
        status: "UNKNOWN",
      };
    } catch (err) {
      return {
        accountId: `bmoni-${userId}`,
        balance: 0,
        currency: "USD",
        status: "ERROR",
      };
    }
  }

  /**
   * Insights are not provided as a dedicated upstream endpoint in this spec snapshot.
   * Return an empty array for now; we can implement derived insights later using
   * transactions or analytics endpoints.
   */
  async getInsights(_userId: string): Promise<BMONIInsight[]> {
    return [];
  }
}
