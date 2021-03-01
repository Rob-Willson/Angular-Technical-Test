export class Coin{
  constructor(
    public readonly id: CoinType,
    public active: boolean
  )
  {}

  public static GetAllCoins(): Coin[] {
    let allCoins: Coin[] = [];
    let allCoinTypes: CoinType[] = this.GetAllCoinTypes();

    // By default we just activate the first currency from the list
    let isFirst: boolean = true;
    allCoinTypes.forEach(coinType => {
      allCoins.push(new Coin(coinType, isFirst));
      isFirst = false;
    });

    return allCoins;
  }

  // Returns a collection of all supported coin types as enums
  private static GetAllCoinTypes(): CoinType[] {
    let allCoinTypes: CoinType[] = [];
    Object.keys(CoinType).forEach(coinType => {
      if(isNaN(Number(coinType))) {
        allCoinTypes.push(CoinType[coinType]);
      }
    });
    return allCoinTypes;
  }

}

// Add new enums here to add new supported currencies
// First parameter = key for in-code references
// Second parameter = descriptor used for display
export enum CoinType {
  BTC = "BTC",
  ETH = "ETH",
  LTC = "LTC",
  ADA = "ADA",
  DOT = "DOT",
  BCH = "BCH",
  XLM = "XLM",
  BNB = "BNB",
  USDT = "USDT",
  XMR = "XMR"
}
