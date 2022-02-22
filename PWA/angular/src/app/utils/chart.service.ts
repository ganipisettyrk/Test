import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from './common.service';
import { HttpRequestService } from './http-request.service';

declare var $;

@Injectable()
export class ChartService {

  constructor(private httpRequestService: HttpRequestService, private commonService: CommonService) { }

  getChartItems(chartId: string, offset: number, maxItems: number): Observable<any> {
    let params = [];
    let contentLangValuesIds: string = this.commonService.getContentLanguageIdsSelected();
    let browsingLanguage = localStorage.getItem("browsingLanguage");

    if (null != contentLangValuesIds && contentLangValuesIds.length != 0 && null != browsingLanguage) {
      params.push({ paramName: 'chartId', paramValue: chartId });
      params.push({ paramName: 'offset', paramValue: offset });
      params.push({ paramName: 'maxItems', paramValue: maxItems });
      params.push({ paramName: 'contentLanguage', paramValue: contentLangValuesIds });
      params.push({ paramName: 'browsingLanguage', paramValue: browsingLanguage });

      return this.httpRequestService.get("getchartitems", params);
    } else {
      //Error to be handled
    }
  }

  getProfileItems(chartId: string, offset: number, maxItems: number): Observable<any> {
    let params = [];
    let browsingLanguage = localStorage.getItem("browsingLanguage");
    params.push({ paramName: 'chartId', paramValue: chartId });
    params.push({ paramName: 'offset', paramValue: offset });
    params.push({ paramName: 'maxItems', paramValue: maxItems });
    if (null != browsingLanguage) {
      params.push({ paramName: 'browsingLanguage', paramValue: browsingLanguage });
    }
    return this.httpRequestService.get("getchartitems", params);
  }

  getFirstItemInChartForPreview(chartId, previewElemId, stopBtnClass) {

    let playerElementId_Profile = document.getElementById(previewElemId);

    if ($(playerElementId_Profile).hasClass(stopBtnClass)) {
      this.commonService.stopPlayerIfApplicable();
    } else {
      this.getProfileItems(chartId, 0, 1)
        .subscribe(resp => {
          let item = resp.items[0];
          this.commonService.toggleAudioControls(false, 'play1b', 'Profile', item, previewElemId);
        })
    }
  }
}
