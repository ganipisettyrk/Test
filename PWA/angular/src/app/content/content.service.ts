import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpRequestService } from '../utils/http-request.service';

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  constructor(private httpService: HttpRequestService) { }

  getContentMetadata(contentId: string, contentType: string, showAvailability: boolean, contentSubtype?: string): Observable<any> {
    let params = [];
    let browsingLanguage = localStorage.getItem("browsingLanguage");
    params.push({ paramName: 'contentId', paramValue: contentId });
    params.push({ paramName: 'contentType', paramValue: contentType });
    params.push({ paramName: 'paramType', paramValue: contentType });
    params.push({ paramName: 'paramSubtype', paramValue: contentSubtype });
    params.push({ paramName: 'browsingLanguage', paramValue: browsingLanguage });
    let extMode = sessionStorage.getItem('EXTERNAL_MODE');
    params.push({ paramName: 'extMode', paramValue: extMode });
    params.push({ paramName: 'showAvailability', paramValue: showAvailability });

    return this.httpService.get('getcontent', params);
  }

  getBannerContentMetadata(contentId: string, contentType: string, showAvailability:boolean ): Observable<any> {
    let params = [];
    let browsingLanguage = localStorage.getItem("browsingLanguage");
    params.push({ paramName: 'contentId', paramValue: contentId });
    params.push({ paramName: 'contentType', paramValue: contentType });
    params.push({ paramName: 'browsingLanguage', paramValue: browsingLanguage });
    let extMode = sessionStorage.getItem('EXTERNAL_MODE');
    params.push({ paramName: 'extMode', paramValue: extMode });
    params.push({ paramName: 'showAvailability', paramValue: showAvailability });

    return this.httpService.get('getbannercontent', params);
  }
}