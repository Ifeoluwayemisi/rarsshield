import { BmoniClient } from "../http/bmoni.client";
import {
  CreateUserRequest,
  CreateWalletRequest,
  WalletSummaryResponse,
} from "../types/dto";
import { BmoniWalletMapper } from "../mappers/bmoni-wallet.mapper";
import { BmoniWalletRepository } from "../repositories/bmoni-wallet.repository";
import { NotImplementedError } from "../errors/not-implemented.error";

export class OnboardingService {
  constructor(
    private readonly client: BmoniClient = new BmoniClient(),
    private readonly walletRepository: BmoniWalletRepository = new BmoniWalletRepository(),
  ) {}

  async createUser(input: CreateUserRequest) {
    const response = await this.client.createUser(
      input as unknown as Record<string, unknown>,
    );
    return {
      id: typeof response.id === "string" ? response.id : "",
      email: input.email,
    };
  }

  async createWallet(userId: string, input: CreateWalletRequest = {}) {
    const response = await this.client.createManagedSmartWallet(
      userId,
      input as unknown as Record<string, unknown>,
    );
    return BmoniWalletMapper.toDto({
      id: typeof response.id === "string" ? response.id : undefined,
      balance: 0,
      currency: input.currency ?? "USD",
      status: "PENDING",
      smartWalletId:
        typeof response.smartWalletId === "string"
          ? response.smartWalletId
          : undefined,
    });
  }

  async getWalletSummary(userId: string): Promise<WalletSummaryResponse> {
    return this.walletRepository.getWalletSummary(userId);
  }

  async completeKyc() {
    throw new NotImplementedError("Sandbox KYC completion");
  }

  async activateNigeriaRail() {
    throw new NotImplementedError("Nigeria Rail activation");
  }
}
