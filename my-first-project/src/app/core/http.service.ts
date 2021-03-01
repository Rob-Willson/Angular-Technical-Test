import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CryptoData } from './data.template';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  private dataProcessed: CryptoData[] = [];
  
  constructor(private httpClient : HttpClient) {}

  getRequestObservable(url: string) : Observable<any> { 
    return this.httpClient.get<any>(url);
  }

}
