import { WalletSummaryResponse } from "../types/dto";

export class BmoniWalletMapper {
  static toDto(payload: Record<string, unknown>): WalletSummaryResponse {
    return {
      id: typeof payload.id === "string" ? payload.id : undefined,
      balance: Number(payload.balance ?? 0),
      currency: typeof payload.currency === "string" ? payload.currency : "USD",
      status: typeof payload.status === "string" ? payload.status : "ACTIVE",
      bmoniUserId:
        typeof payload.bmoniUserId === "string" ? payload.bmoniUserId : null,
      smartWalletId:
        typeof payload.smartWalletId === "string"
          ? payload.smartWalletId
          : null,
    };
  }
}
