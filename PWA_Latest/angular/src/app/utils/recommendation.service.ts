import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpRequestService } from './http-request.service';
import { CommonService } from './common.service';

@Injectable()
export class RecommendationService {

  constructor(private httpService: HttpRequestService, private commonService: CommonService) { }

  getRecommendationItems(contentId: string, albumName: string, offset: number, maxCount: number): Observable<any> {
    let params = [];
    params.push({ paramName: 'contentId', paramValue: contentId });
    params.push({ paramName: 'albumName', paramValue: albumName });
    params.push({ paramName: 'offset', paramValue: offset });
    params.push({ paramName: 'maxCount', paramValue: maxCount });

    return this.httpService.get('getrecommendations', params);
  }


  getMultiContentRecommendations(contentIds: string, offset: number, maxCount: number, albumName: string): Observable<any> {
    let params = [];
    let contentLangIds: string = this.commonService.getContentLanguageIdsSelected();
    if (contentLangIds && contentLangIds.length > 0) {
      params.push({ paramName: 'language', paramValue: contentLangIds });
    }
    
    if (contentIds && contentIds.length > 0) {
      params.push({ paramName: 'contentIds', paramValue: contentIds });
    }
    params.push({ paramName: 'offset', paramValue: offset });
    params.push({ paramName: 'maxCount', paramValue: maxCount });
    if (albumName != null) {
      params.push({ paramName: 'albumName', paramValue: albumName });
    }
    
    return this.httpService.get('getmulticontentrecommendations', params);
  }

}