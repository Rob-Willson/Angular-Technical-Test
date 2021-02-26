import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RequestData } from './data.template';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  // TODO: Why is this "undefined" assignment required?
  requestData: RequestData | undefined;

  constructor(private httpClient : HttpClient) { }

  getRequest(url: string) {
    console.log("CALLED: getRequest to '" + url + "'")
    
    this.httpClient.get<any>(url).subscribe(
      response => {
        console.log(response);
        this.requestData = response;
      }
    );
  }

}
