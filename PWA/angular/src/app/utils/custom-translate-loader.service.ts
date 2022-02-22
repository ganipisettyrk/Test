import { Injectable } from '@angular/core';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { HttpRequestService } from './http-request.service';


@Injectable({
  providedIn: 'root'
})
export class CustomTranslateLoaderService implements TranslateLoader {

  constructor(private httpRequestService: HttpRequestService) { }

  getTranslation(lang: string): Observable<any> {
    let params = [];
    if (null != lang) {
      params.push({ paramName: 'browsingLanguage', paramValue: lang });
    }
    return this.httpRequestService.get('messagebundle', params);
  }

}
