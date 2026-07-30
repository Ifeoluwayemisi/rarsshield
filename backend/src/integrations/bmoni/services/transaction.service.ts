import { TransactionResponse } from "../types/dto";
import { BmoniWalletRepository } from "../repositories/bmoni-wallet.repository";

export class TransactionService {
  constructor(
    private readonly walletRepository: BmoniWalletRepository = new BmoniWalletRepository(),
  ) {}

  async getTransactions(userId: string): Promise<TransactionResponse[]> {
    return this.walletRepository.getTransactions(userId);
  }
}
