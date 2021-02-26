import { Component, OnInit } from '@angular/core';
import { HttpService } from '../core/http.service';

@Component({
  selector: 'app-option-b',
  templateUrl: './option-b.component.html',
  styleUrls: ['./option-b.component.css']
})

export class OptionBComponent implements OnInit {
  private readonly urlBase: string = "https://min-api.cryptocompare.com/data/v2/histoday";
  private urlCurrencies: string[] = ["fsym=BTC", "tsym=USD"];
  private urlCount: number = 5;
  // TODO: API key?
  
  constructor(private httpService : HttpService) { }

  ngOnInit(): void {
    this.httpService.getRequest(this.buildUrl());
  }

  private buildUrl() : string {
    let url : string = this.urlBase + "?";

    this.urlCurrencies.forEach(currency => {
      url += currency + "&"
    })

    // Cryptocompare API uses base 0 for it's counts, but most humans don't
    url += "limit=" + (this.urlCount - 1);

    return url;
  }
}
