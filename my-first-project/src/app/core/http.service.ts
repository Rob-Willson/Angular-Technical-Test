import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CryptoData } from './data.template';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  private dataProcessed: CryptoData[] = [];
  
  constructor(private httpClient : HttpClient) {}

  getRequest(url: string): CryptoData[] {
    console.log("CALLED: getRequest to '" + url + "'")
    
    this.httpClient.get<any>(url).subscribe(
      response => {
        this.dataProcessed = CryptoData.ParseFromJSON(response);

        this.dataProcessed.forEach(element => {
          console.log(element);
        });

        return this.dataProcessed;
      }
    );

    // TODO: This fallthrough will only every return an empty collection, not sure when it's actually called
    //       Probably missing something here... observers?
    return this.dataProcessed;
  }
  
}
