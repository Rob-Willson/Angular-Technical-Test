import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private httpClient : HttpClient) {}

  public getRequestCryptocompareHistoric(urlCurrencyId: string, urlCurrencyStandardId: string, urlCount: number) : Observable<any> {
    let urlBase: string = "https://min-api.cryptocompare.com/data/v2/histoday";
    let apiKey: string = "";  // Not for github's eyes

    // Build the endpoint url
    let url : string = urlBase + "?";
    // Request requires a querying currency (fsym) and a standard (tsym) to compare it with
    url += "fsym=" + urlCurrencyId + "&";
    url += "tsym=" + urlCurrencyStandardId;
    url += "&limit=" + (urlCount);
    if(apiKey) {
      url += "&api_key=" + "apiKey";
    }
    
    console.log("ENDPOINT: " + url);
    return this.getRequestObservable(url);
  }

  private getRequestObservable(url: string) : Observable<any> { 
    return this.httpClient.get<any>(url);
  }

}
