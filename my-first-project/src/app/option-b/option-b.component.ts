import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

// Parsed data output from crypto API endpoint
export class RequestData {
  constructor(
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

@Component({
  selector: 'app-option-b',
  templateUrl: './option-b.component.html',
  styleUrls: ['./option-b.component.css']
})

export class OptionBComponent implements OnInit {
  
  // TODO: Why is this "undefined" assignment required?
  requestData: RequestData | undefined;

  constructor(private httpClient : HttpClient) { }

  ngOnInit(): void {
    console.log("init");
    this.getRequest();
  }

  getRequest() {
    let url = 'https://min-api.cryptocompare.com/data/v2/histoday?fsym=BTC&tsym=USD&limit=10';
    this.httpClient.get<any>(url).subscribe(
      response => {
        console.log(response);
        this.requestData = response;
      }
    );
  }

}
