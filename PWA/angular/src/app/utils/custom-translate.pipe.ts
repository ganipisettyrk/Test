import { ChangeDetectorRef, Pipe } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs/operators';

@Pipe({
  name: 'customTranslate',
  pure: false
})
export class CustomTranslatePipe extends TranslatePipe {

  constructor(translate: TranslateService, _ref: ChangeDetectorRef, public trans: TranslateService) {
    super(translate, _ref);
  }


  transform(query: string, ...args: any[]): any {

    let isStoreIdentificationRequired = sessionStorage.getItem("isStoreIdentificationRequired");
    let storeId = sessionStorage.getItem("storeId");

    if (null != isStoreIdentificationRequired) {
      return this.transformWithKey(query, isStoreIdentificationRequired, storeId, ...args);
    }
    else {
      let keyForCheck = 'pwa.store.identification.required';
      this.trans.get(keyForCheck).pipe(
        map(response => {
          if (response != keyForCheck) {
            let isStoreIdentificationRequired = (response.trim() == 'true');
            if (isStoreIdentificationRequired) {
              sessionStorage.setItem("isStoreIdentificationRequired", "true");
            }
            return this.transformWithKey(query, response, storeId, ...args);
          }
          else {
            return super.transform(query, ...args);
          }
        }));

    }

    return super.transform(query, ...args);

  }

  private transformWithKey(key: string, isStoreIdentificationRequired: string,
    storeId: string, ...args: any[]): any {

    if (isStoreIdentificationRequired == "true") {
      if (null != storeId) {
        let updatedKey = key + "." + storeId;
        let res = this.trans.instant(updatedKey);
        if (res != updatedKey) {
          return super.transform(updatedKey, ...args);
        }
        else {
          return super.transform(key, ...args);
        }

      }
      else {
        return super.transform(key, ...args);
      }
    }
    else {
      return super.transform(key, ...args);
    }

  }

}
