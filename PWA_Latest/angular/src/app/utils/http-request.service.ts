import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class HttpRequestService {


  constructor(private http: HttpClient) { }

  public get(url: string, parameters?: any, responseType?: any): Observable<any> {

    if (!responseType) {
      responseType = 'json';
    }

    let params = new HttpParams();
    if (parameters && parameters.length > 0) {
      for (let i = 0; i < parameters.length; i++) {
        params = params.append(parameters[i].paramName, parameters[i].paramValue);
      }
    } else {
      //To avoid caching this is required
      let currentDate: Date = new Date();
      params = params.append('val', currentDate.getTime().toString());
    }

    let options = {
      params: params,
      responseType: responseType
    };
    return this.http.get(url, options);
  }


  public post(url: string, requestObj: any, parameters?: any, responseType?: any): Observable<any> {

    if (!responseType) {
      responseType = 'json';
    }

    let params = new HttpParams();
    if (parameters) {
      for (let i = 0; i < parameters.length; i++) {
        params = params.append(parameters[i].paramName, parameters[i].paramValue);
      }
    }
    let options = {
      params: params,
      responseType: responseType
    };
    return this.http.post(url, requestObj, options);
  }
}