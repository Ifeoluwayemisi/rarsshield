const {
  buildInsightsFromWalletAndTransactions,
} = require("../dist/services/FinancialInsightService");

describe("Financial insight generation", () => {
  it("creates alerts for low balance and large transfer activity", () => {
    const insights = buildInsightsFromWalletAndTransactions(
      {
        balance: 450,
        currency: "NGN",
        status: "ACTIVE",
      },
      [
        {
          amount: 8000,
          description: "Large transfer",
          status: "COMPLETED",
          createdAt: "2025-01-01T00:00:00.000Z",
        },
        {
          amount: 7000,
          description: "Another large transfer",
          status: "COMPLETED",
          createdAt: "2025-01-01T01:00:00.000Z",
        },
      ],
    );

    expect(insights).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: "wallet",
          title: expect.stringContaining("Low cash balance"),
        }),
        expect.objectContaining({
          category: "activity",
          title: expect.stringContaining("High-value transfer"),
        }),
      ]),
    );
  });
});
