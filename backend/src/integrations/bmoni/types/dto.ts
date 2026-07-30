export interface CreateUserRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  countryCode?: string;
}

export interface CreateWalletRequest {
  currency?: string;
  ownerAddress?: string;
}

export interface WalletSummaryResponse {
  id?: string;
  balance: number;
  currency: string;
  status: string;
  bmoniUserId?: string | null;
  smartWalletId?: string | null;
}

export interface BalanceResponse {
  balance: number;
  currency: string;
  status: string;
}

export interface TransactionResponse {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description?: string;
}

export interface KYCStatusResponse {
  status: string;
  completed: boolean;
}

export interface HealthResponse {
  provider: string;
  status: string;
  connected: boolean;
  baseUrl?: string;
  version?: string;
}
