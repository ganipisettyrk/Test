import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpRequestService } from '../utils/http-request.service';

@Injectable()
export class ConsentService {

  constructor(private httpService: HttpRequestService) { }

  getConsentResponse(queryParams: any): Observable<any> {
    let params = [];
    let url = 'getconsentresp?' + queryParams;

    return this.httpService.get(url, params);
  }
}