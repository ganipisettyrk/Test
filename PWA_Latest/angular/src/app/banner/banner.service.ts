import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from '../utils/common.service';
import { HttpRequestService } from '../utils/http-request.service';

@Injectable()
export class BannerService {

  constructor(private httpRequestService: HttpRequestService, private commonService: CommonService) { }

  getBannerItems(contentLangValuesIds: string, bannerGroup: string): Observable<any> {
    let params = [];
    params.push({ paramName: 'contentLanguage', paramValue: contentLangValuesIds });
    params.push({ paramName: 'bannerGroup', paramValue: bannerGroup });

    return this.httpRequestService.get("getbanners", params);
  }

  getBannerContentMetadata(bannerItemsRingback: any, showAvailability: boolean): void {

    let browsingLanguage = localStorage.getItem("browsingLanguage");
    let extMode = sessionStorage.getItem('EXTERNAL_MODE');
    let params = {
      browsingLanguage: browsingLanguage,
      bannerItemsRingback: bannerItemsRingback,
      extMode: extMode,
      showAvailability: showAvailability
    };
    this.commonService.checkAndInitializeWorker("bannerContent", params);
  }

}
