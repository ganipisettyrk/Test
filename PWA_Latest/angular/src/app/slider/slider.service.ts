import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpRequestService } from '../utils/http-request.service';
import { CommonService } from '../utils/common.service';

@Injectable()
export class SliderService {

  constructor(private commonService: CommonService,
    private httpRequestService: HttpRequestService) { }

  getDynamicChartItems(chartId: string, offset: number, maxItems: number): Observable<any> {
    let params = [];
    let contentLangValuesIds: string = this.commonService.getContentLanguageIdsSelected();
    params.push({ paramName: 'chartId', paramValue: chartId });
    params.push({ paramName: 'offset', paramValue: offset });
    params.push({ paramName: 'maxItems', paramValue: maxItems });
    params.push({ paramName: 'contentLanguage', paramValue: contentLangValuesIds });
    return this.httpRequestService.get("getdynamicchartitems", params);
  }
}
