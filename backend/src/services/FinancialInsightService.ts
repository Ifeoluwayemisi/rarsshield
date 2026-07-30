export interface InsightWalletLike {
  balance?: number | string | { toNumber(): number };
  currency?: string;
  status?: string;
}

export interface InsightTransactionLike {
  amount?: number | string | { toNumber(): number };
  description?: string | null;
  status?: string;
  createdAt?: Date | string;
}

export interface DerivedInsight {
  id: string;
  category: string;
  title: string;
  summary: string;
  score: number;
  severity: string;
}

function toNumber(value: unknown): number {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    return Number(value);
  }

  if (
    value !== null &&
    typeof value === "object" &&
    "toNumber" in value &&
    typeof (value as { toNumber?: unknown }).toNumber === "function"
  ) {
    return Number((value as { toNumber: () => number }).toNumber());
  }

  return 0;
}

export function buildInsightsFromWalletAndTransactions(
  wallet: InsightWalletLike | null | undefined,
  transactions: InsightTransactionLike[] = [],
): DerivedInsight[] {
  const balance = toNumber(wallet?.balance ?? 0);
  const currency = wallet?.currency ?? "USD";
  const insights: DerivedInsight[] = [];

  if (balance < 1000) {
    const severity = balance < 500 ? "HIGH" : "MEDIUM";
    insights.push({
      id: `wallet-low-balance-${Date.now()}`,
      category: "wallet",
      title: `Low cash balance alert (${currency} ${balance.toFixed(0)})`,
      summary:
        "Your wallet balance is below the suggested safety cushion. Keep a reserve for emergencies and review recent transfers.",
      score: Math.min(100, 100 - balance / 10),
      severity,
    });
  }

  const completedTransactions = transactions.filter((transaction) => {
    const status = transaction.status?.toString().toUpperCase() ?? "";
    return status === "COMPLETED";
  });

  const largeTransfers = completedTransactions.filter(
    (transaction) => toNumber(transaction.amount) >= 5000,
  );

  if (largeTransfers.length > 0) {
    const largestAmount = Math.max(
      ...largeTransfers.map((transaction) => toNumber(transaction.amount)),
    );
    const severity = largestAmount >= 10000 ? "HIGH" : "MEDIUM";
    const transferCountLabel =
      largeTransfers.length > 1
        ? `${largeTransfers.length} large transfers`
        : "a large transfer";

    insights.push({
      id: `activity-large-transfer-${Date.now()}`,
      category: "activity",
      title: "High-value transfer detected",
      summary: `You have completed ${transferCountLabel} recently, which may warrant a quick security review.`,
      score: Math.min(100, 50 + largestAmount / 100),
      severity,
    });
  }

  return insights;
}

export class FinancialInsightService {
  buildInsights(
    wallet: InsightWalletLike | null | undefined,
    transactions: InsightTransactionLike[] = [],
  ): DerivedInsight[] {
    return buildInsightsFromWalletAndTransactions(wallet, transactions);
  }
}
