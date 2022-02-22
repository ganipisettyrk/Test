import { Injectable } from "@angular/core";
import { Observable, Subject } from 'rxjs';
import { HttpRequestService } from './../utils/http-request.service';

@Injectable()
export class SearchService {

  private selectedContentType = new Subject<string>();

  constructor(private httpService: HttpRequestService) { }

  getCategorisedSearchResults(searchString: string, genre: string, offset: number,
    maxItems: number, contentLangValuesIds: string, isRTContent: boolean) {

    let params = [];
    params.push({ paramName: 'searchQuery', paramValue: searchString });
    params.push({ paramName: 'genre', paramValue: genre });
    params.push({ paramName: 'contentLanguage', paramValue: contentLangValuesIds });
    params.push({ paramName: 'isRTContent', paramValue: isRTContent });

    if (null != offset) {
      params.push({ paramName: 'offset', paramValue: offset });
    }
    if (null != maxItems) {
      params.push({ paramName: 'maxItems', paramValue: maxItems });
    }

    return this.httpService.get('getcategorisedsearchresults', params);

  }

  setRTToggleSelection(type: string) {
    this.selectedContentType.next(type);
  }

  getRTToggleSelection(): Observable<string> {
    return this.selectedContentType.asObservable();
  }

}
