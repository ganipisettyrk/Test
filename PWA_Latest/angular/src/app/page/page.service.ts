import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CustomTranslateService } from '../utils/custom-translate.service';
import { HttpRequestService } from '../utils/http-request.service';


@Injectable()
export class PageService {

  constructor(private httpService: HttpRequestService, private translate: CustomTranslateService) {

  }
  getResponse(pageType: string): Observable<any> {
    let browsingLanguage = localStorage.getItem("browsingLanguage");
    // let api;
    // let params = [];
    // if (url.startsWith('%CATALOG_URL%') || url.startsWith('%STORE_URL%')) {
    //   let linkType = this.translate.instant('pwa.' + pageType + '.link');
    //   let key = '%' + pageType.toUpperCase() + '_LINK%';
    //   url = url.replace(key, linkType);
    //   api = 'getdynamicpagedata';
    //   params.push({ paramName: 'browsingLanguage', paramValue: browsingLanguage });
    // }
    // else {
    //   api = 'getstaticpagedata';
    // }
    // params.push({ paramName: 'url', paramValue: url });
    let params = [];
    params.push({ paramName: 'browsingLanguage', paramValue: browsingLanguage });
    params.push({ paramName: 'pageType', paramValue: pageType });
    return this.httpService.get('getdynamicpagedata', params);
  }
}
