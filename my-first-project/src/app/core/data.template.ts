// Raw data output format from crypto API endpoint
// Don't touch variable names unless you want to break stuff
export class CryptoDataRaw {
  constructor(
    public Response: string,
    public Message: string,
    public HasWarning: boolean,
    public Type: number,
    public Data: CryptoDataRawSummary
  )
  {}
}
export class CryptoDataRawSummary {
  constructor(
    public Aggregated: boolean,
    public TimeFrom: number,
    public TimeTo: number,
    public Data: CryptoDataRawSummaryData[]
  )
  {}
}
export class CryptoDataRawSummaryData {
  constructor(
    public time: number,
    public high: number,
    public low: number,
    public open: number,
    public volumefrom: number,
    public volumeto: number,
    public close: number,
    public conversionType: string,
    public conversionSymbol: string
  )
  {}
}

// Processed data object ready for use
// TODO: Observables?
export class CryptoData {
  private constructor(
    public readonly currency: string,
    public readonly time: number,
    public readonly high: number,
    public readonly low: number
  )
  {}

  public static ParseFromJSON (rawJsonData: any): CryptoData[] {
    let dataRaw: CryptoDataRaw = rawJsonData
    let cryptoDataProcessed: CryptoData[] = [];

    for (let i = 0; i < dataRaw.Data.Data.length; i++) {
      cryptoDataProcessed.push(new CryptoData(
        "currencyId" + i,
        dataRaw.Data.Data[i].time,
        dataRaw.Data.Data[i].high,
        dataRaw.Data.Data[i].low
      ));
    }

    return cryptoDataProcessed;
  }  
}
