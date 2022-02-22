import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class CustomTranslateService {

  constructor(private translate: TranslateService) { }

  get(key: string | Array<string>, interpolateParams?: Object): Observable<string | any> {

    let isStoreIdentificationRequired = sessionStorage.getItem("isStoreIdentificationRequired");
    let storeId = sessionStorage.getItem("storeId");

    if (null != isStoreIdentificationRequired && isStoreIdentificationRequired == "true") {
      if (null != storeId) {
        let storeSpecificKey = key + "." + storeId;
        let res = this.translate.instant(storeSpecificKey, interpolateParams);

        if (null != res && res != storeSpecificKey) {
          return new Observable((observer) => {
            observer.next(res);
            observer.complete();
          });
        }
        else {
          return this.getKeyValue(key, interpolateParams);
        }
      }
      else {
        return this.getKeyValue(key, interpolateParams);
      }
    }
    else {
      return this.getKeyValue(key, interpolateParams);
    }
  }


  private getKeyValue(key: string | Array<string>, interpolateParams?: Object): Observable<string | any> {
    return this.translate.get(key, interpolateParams);
  }

  private getInstantValue(key: string | Array<string>, interpolateParams?: Object): string | any {
    return this.translate.instant(key, interpolateParams);

  }

  instant(key: string | Array<string>, interpolateParams?: Object): string | any {
    let isStoreIdentificationRequired = sessionStorage.getItem("isStoreIdentificationRequired");
    let storeId = sessionStorage.getItem("storeId");

    if (null != isStoreIdentificationRequired && isStoreIdentificationRequired == "true") {
      if (null != storeId) {
        let storeSpecificKey = key + "." + storeId;
        let res = this.getInstantValue(storeSpecificKey, interpolateParams);
        if (null != res && res != storeSpecificKey) {
          return res;
        }
        else {
          return this.getInstantValue(key, interpolateParams);
        }

      }
      else {
        return this.getInstantValue(key, interpolateParams);
      }
    }
    else {
      return this.getInstantValue(key, interpolateParams);
    }
  }


}


