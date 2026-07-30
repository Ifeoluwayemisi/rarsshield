const {
  BmoniWalletMapper,
} = require("../dist/integrations/bmoni/mappers/bmoni-wallet.mapper");

describe("BmoniWalletMapper", () => {
  it("maps a BMONI wallet payload to an internal wallet DTO", () => {
    const mapped = BmoniWalletMapper.toDto({
      id: "wallet-1",
      balance: 1250,
      currency: "NGN",
      status: "ACTIVE",
    });

    expect(mapped).toMatchObject({
      id: "wallet-1",
      balance: 1250,
      currency: "NGN",
      status: "ACTIVE",
    });
  });
});
