import { BalanceResponse } from "../types/dto";
import { BmoniWalletRepository } from "../repositories/bmoni-wallet.repository";

export class BalanceService {
  constructor(
    private readonly walletRepository: BmoniWalletRepository = new BmoniWalletRepository(),
  ) {}

  async getBalance(userId: string): Promise<BalanceResponse> {
    return this.walletRepository.getBalance(userId);
  }
}
