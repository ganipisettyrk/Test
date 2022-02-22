import { CurrencyPipe, TitleCasePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Observable } from 'rxjs';
import { ContentService } from '../content/content.service';
import { PopupDataItem, PopupService } from '../popup/popup.service';
import { HttpRequestService } from './http-request.service';

@Injectable({
  providedIn: 'root'
})

export class PurchaseService {

  constructor(private httpService: HttpRequestService,
    private currencyPipe: CurrencyPipe,
    private deviceService: DeviceDetectorService,
    private popupService: PopupService,
    private contentService: ContentService,
    private router: Router,
    private titleCasePipe: TitleCasePipe) { }

  getPurchaseData(contentId, contentType, contentSubtype): Observable<any> {
    let params = {
      "contentId": contentId,
      "contentType": contentType,
      "contentSubtype": contentSubtype,
      "extMode": sessionStorage.getItem('EXTERNAL_MODE'),
      "browsingLanguage": localStorage.getItem('browsingLanguage')
    };
    return this.httpService.post('getpurchasedata', params);
  }

  purchaseContent(contentId, contentType, caller, retailPriceId, subtype,
    subscriptionId, profilePlayRange, madeRefId, madeContext): Observable<any> {
    let utmParams: string;
    if (this.deviceService.isDesktop()) {
      utmParams = sessionStorage.getItem('UTM_PARAMS');
    } else {
      utmParams = localStorage.getItem('UTM_PARAMS');
    }
    let params = {
      "contentId": contentId,
      "contentType": contentType,
      "caller": caller,
      "retailPriceId": retailPriceId,
      "subtype": subtype,
      "subscriptionId": subscriptionId,
      "profilePlayRange": profilePlayRange,
      "browsingLanguage": localStorage.getItem('browsingLanguage'),
      "utm_params": utmParams,
      "madeRefId": madeRefId,
      "madeContext": madeContext,
      "extMode": sessionStorage.getItem('EXTERNAL_MODE')
    };

    return this.httpService.post('purchase', params);
  }

  getUserStatus(isRTContent: boolean): Observable<any> {
    let params = [];
    if (isRTContent) {
      params.push({ paramName: 'isRTContent', paramValue: isRTContent });
    }
    return this.httpService.get('getuserstatus', params, 'text')
  }

  getPaymentMethods(contentId, contentType, caller, retailPriceId,
    subtype, subscriptionId, profilePlayRange): Observable<any> {
    let params = {
      "contentId": contentId,
      "contentType": contentType,
      "caller": caller,
      "retailPriceId": retailPriceId,
      "subtype": subtype,
      "subscriptionId": subscriptionId,
      "profilePlayRange": profilePlayRange
    };

    return this.httpService.post('getpaymentmethods', params);
  }

  public getExistingUserPriceDescription(priceDescField: string, contentMetadata: any): string {
    let priceDesc = '';
    if (priceDescField == 'short_description') {
      priceDesc = contentMetadata.availability[0].individual[0].short_description;
    } else if (priceDescField == 'description') {
      priceDesc = contentMetadata.availability[0].individual[0].description;
    }
    return priceDesc;
  }

  public getNewUserPriceDescription(priceDescFieldNewUser: string, subscriptionObj: any): string {
    let priceDesc = '';
    if (priceDescFieldNewUser == 'short_description') {
      priceDesc = subscriptionObj.short_description;
    } else if (priceDescFieldNewUser == 'description') {
      priceDesc = subscriptionObj.description;
    }
    return priceDesc;
  }

  public getPurchasePlanText(subscription: any): string {
    let amount = subscription.retail_price.amount;
    let currency = subscription.retail_price.currency;
    let unit = subscription.period.unit;
    let length = subscription.period.length;
    amount = this.currencyPipe.transform(amount, currency);

    if (length > 1) {
      unit += 'S';
      unit = this.titleCasePipe.transform(unit);
    }
    return amount + ' (' + length + ' ' + unit + ')';
  }

  public openPurchasePopup(contentMetadata: any, contentType: string): void {
    let contentId = '';
    let typeStr = '';
    if (contentType == 'ringback') {
      typeStr = 'purchase';
      contentId = contentMetadata.ringback.id;
    } else if (contentType == 'realtone') {
      typeStr = 'rt_purchase';
      contentId = contentMetadata.realtone.id;
    }
    this.contentService.getContentMetadata(contentId, contentType, true)
      .subscribe(resp => {
        if (resp && resp.status != 'failure') {
          let popupItem: PopupDataItem = {
            isLoggedIn: true,
            type: typeStr,
            popupData: resp,
            heading: null,
            response: "",
            showCloseButton: true,
            historyIndex: "",
            pageName: "",
            isSetForNone: false
          };
          this.popupService.showPopup(popupItem);
        } else {
          this.popupService.closePopup();
          this.router.navigateByUrl('/error');
        }
      })
  }
}
