import { BMONIClient } from "./BMONIClient";
import { WalletRepository } from "../../repositories/WalletRepository";
import { FinancialInsightRepository } from "../../repositories/FinancialInsightRepository";
import { UserRepository } from "../../repositories/UserRepository";
import { OnboardingService } from "./services/onboarding.service";
import { BalanceService } from "./services/balance.service";
import { HealthService } from "./services/health.service";
import { FinancialInsightService } from "../../services/FinancialInsightService";
import { prisma } from "../../database/prisma";

export class BMONIService {
  private client = new BMONIClient();
  private walletRepository = new WalletRepository();
  private financialInsightRepository = new FinancialInsightRepository();
  private userRepository = new UserRepository();
  private onboardingService = new OnboardingService(this.client as never);
  private balanceService = new BalanceService(this.client as never);
  private healthService = new HealthService(this.client as never);
  private financialInsightService = new FinancialInsightService();

  async getInfo() {
    return this.healthService.getHealth();
  }

  async onboardUser(
    userId: string,
    input: {
      email?: string;
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
      countryCode?: string;
      currency?: string;
      ownerAddress?: string;
      createSmartWallet?: boolean;
    } = {},
  ) {
    const localUser = await this.userRepository.findById(userId);
    if (!localUser) {
      throw new Error("Local user not found");
    }

    const existingWallet = await this.walletRepository.findByUserId(userId);
    const email = input.email || localUser.email;
    const nameParts = (localUser.name || "").trim().split(" ");
    const firstName = input.firstName || nameParts[0] || "User";
    const lastName = input.lastName || nameParts.slice(1).join(" ") || "User";
    const phoneNumber = input.phoneNumber || "+2348000000000";
    const countryCode = input.countryCode || "NG";

    const createdUser = await this.client.createUser({
      email,
      firstName,
      lastName,
      phoneNumber,
      countryCode,
    });

    const bmoniUserId =
      createdUser.id ||
      (createdUser as any).userId ||
      existingWallet?.bmoniUserId ||
      `usr_${Date.now().toString(36)}`;

    const walletPayload = {
      balance: existingWallet?.balance ? Number(existingWallet.balance) : 0,
      currency: existingWallet?.currency ?? "USD",
      provider: "BMONI",
      status: existingWallet?.status ?? "ACTIVE",
      bmoniUserId,
      metadata: {
        source: "local-onboarding",
        email,
      },
    };

    await this.walletRepository.upsertForUser(userId, walletPayload);

    let smartWallet: { id?: string; smartWalletId?: string | null } | undefined;
    let smartWalletId: string | null = existingWallet?.smartWalletId || null;

    if (input.createSmartWallet !== false && bmoniUserId) {
      const swResp = await this.client.createManagedSmartWallet(bmoniUserId, {
        currency: input.currency ?? "USD",
        ownerAddress: input.ownerAddress,
      });

      smartWalletId =
        swResp.smartWalletId ||
        swResp.id ||
        (swResp as any).address ||
        (swResp as any).smartWalletAddress ||
        smartWalletId;

      if (smartWalletId) {
        await this.walletRepository.upsertForUser(userId, {
          ...walletPayload,
          smartWalletId: String(smartWalletId),
        });
      }
      smartWallet = {
        id: swResp.id,
        smartWalletId,
      };
    }

    const updatedWallet = await this.walletRepository.findByUserId(userId);

    return {
      success: true,
      bmoniUserId: updatedWallet?.bmoniUserId || bmoniUserId,
      smartWalletId: updatedWallet?.smartWalletId || smartWalletId,
      smartWallet,
      wallet: updatedWallet,
    };
  }

  async syncWallet(userId: string) {
    const summary = await this.balanceService.getBalance(userId);

    return this.walletRepository.upsertForUser(userId, {
      balance: summary.balance,
      currency: summary.currency,
      provider: "BMONI",
      status: summary.status,
    });
  }

  async getWallet(userId: string) {
    return this.walletRepository.findByUserId(userId);
  }

  async syncInsights(userId: string) {
    const wallet = await this.walletRepository.findByUserId(userId);
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const insights = this.financialInsightService.buildInsights(
      wallet,
      transactions,
    );

    await this.financialInsightRepository.replaceForUser(userId, insights);
    return this.financialInsightRepository.listByUser(userId);
  }

  async getInsights(userId: string) {
    return this.financialInsightRepository.listByUser(userId);
  }
}
