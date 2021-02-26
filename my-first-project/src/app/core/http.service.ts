import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CryptoData } from './data.template';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  // TODO: Why is this "undefined" assignment required?
  dataProcessed: CryptoData | undefined;

  constructor(private httpClient : HttpClient) { }

  getRequest(url: string) {
    console.log("CALLED: getRequest to '" + url + "'")
    
    this.httpClient.get<any>(url).subscribe(
      response => {
        let allDataProcessed: CryptoData[] = CryptoData.ParseFromJSON(response);

        allDataProcessed.forEach(element => {
          console.log(element);
        });
      }
    );
  }
  
}
