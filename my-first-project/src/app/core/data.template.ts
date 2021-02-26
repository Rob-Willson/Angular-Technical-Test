// Data output format from crypto API endpoint
export class RequestData {
    public constructor(
      public Response: string,
      public Message: string,
      public HasWarning: boolean,
      public Type: number,
      public Data: Data
    )
    {}
  }
  export class Data {
    constructor(
      public Aggregated: boolean,
      public TimeFrom: number,
      public TimeTo: number,
      public Data: Datum[]
    )
    {}
  }
  export class Datum {
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
