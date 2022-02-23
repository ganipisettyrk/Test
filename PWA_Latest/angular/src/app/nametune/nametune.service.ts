import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpRequestService } from '../utils/http-request.service';

@Injectable()
export class NametuneService {
  type: any;

  constructor(private httpRequestService: HttpRequestService) { }

  getNameTuneItems(nameTune: string, offset: number, maxItems: number): Observable<any> {
    let params = [];

    params.push({ paramName: 'nameTune', paramValue: nameTune });
    params.push({ paramName: 'offset', paramValue: offset });
    params.push({ paramName: 'maxItems', paramValue: maxItems });
    params.push({ paramName: 'type', paramValue: this.type });
    return this.httpRequestService.get("getnametunes", params);
  }

  createNameTune(nameTune: string): Observable<any> {
    let params = [];
    params.push({ paramName: 'nameTune', paramValue: nameTune });
    params.push({ paramName: 'type', paramValue: 'ringback_' + this.type });
    return this.httpRequestService.post("createnametune", null, params);
  }

}
