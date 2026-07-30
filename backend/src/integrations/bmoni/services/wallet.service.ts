import { BalanceService } from "./balance.service";
import { OnboardingService } from "./onboarding.service";
import { TransactionService } from "./transaction.service";
import { HealthService } from "./health.service";

export class WalletService {
  constructor(
    private readonly onboardingService: OnboardingService = new OnboardingService(),
    private readonly balanceService: BalanceService = new BalanceService(),
    private readonly transactionService: TransactionService = new TransactionService(),
    private readonly healthService: HealthService = new HealthService(),
  ) {}

  async getHealth() {
    return this.healthService.getHealth();
  }

  async createUser(input: {
    email: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    countryCode?: string;
  }) {
    return this.onboardingService.createUser(input);
  }

  async createWallet(
    userId: string,
    input: { currency?: string; ownerAddress?: string } = {},
  ) {
    return this.onboardingService.createWallet(userId, input);
  }

  async getWalletSummary(userId: string) {
    return this.onboardingService.getWalletSummary(userId);
  }

  async getBalance(userId: string) {
    return this.balanceService.getBalance(userId);
  }

  async getTransactions(userId: string) {
    return this.transactionService.getTransactions(userId);
  }
}
