import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { CommonService } from 'src/app/utils/common.service';
import { CustomTranslateService } from 'src/app/utils/custom-translate.service';
import { HttpRequestService } from 'src/app/utils/http-request.service';


@Injectable({
  providedIn: 'root'
})
export class MenuService {

  private accountToggle = new Subject<string>();

  constructor(private translate: CustomTranslateService, private httpService: HttpRequestService, private commonService: CommonService) { }

  public populateMenuSettingsItems(): Promise<any> {
    return this.translate.get('pwa.menu.settings.size')
      .toPromise()
      .then(menuSettingsItemsSize => {
        let menuSettingsItems: menuItem[] = [];
        let loggedIn = sessionStorage.getItem("loggedIn") == "true";
        let showAccount = this.translate.instant('pwa.menu.settings.enable.myaccount') == "true";
        menuSettingsItems = this.getMenuSettingItems(loggedIn, showAccount, menuSettingsItems, menuSettingsItemsSize);
        return menuSettingsItems;
      });
  }

  private getMenuSettingItems(loggedIn: boolean, showAccount: boolean, menuSettingsItems: menuItem[], menuSettingsItemsSize): menuItem[] {

    let myAccountDetails = JSON.parse(sessionStorage.getItem("PlanDetails"));
    if (myAccountDetails && showAccount && loggedIn) {
      let status: string = myAccountDetails.Subscription_status;
      let rtStatus = this.commonService.getRtUserStatus();
      if (status) {
        let statusStr: string = this.translate.instant('pwa.myaccount.disable.for.status');
        let statusArr = statusStr.split(",");
        let disable = false;
        if (null != statusArr) {
          for (let i = 0; i < statusArr.length; i++) {
            if (statusArr[i].trim() == status) {
              disable = true;
            }
          }
        }
        if (!disable) {
          let item: menuItem = this.getMyAccountDetails(myAccountDetails);
          menuSettingsItems.push(item);
        } else if (rtStatus) {
          let rtStatusConfig: string = this.translate.instant('pwa.rt.myaccount.disable.for.status');
          if (rtStatusConfig.indexOf(rtStatus) <= -1) {
            let item: menuItem = this.getMyAccountDetails(null);
            menuSettingsItems.push(item);
          }
        }
      }
    }
    
    let showChangeNumber = this.translate.instant('pwa.menu.show.change.number') == 'true';
    if (loggedIn && showChangeNumber) {
      let item: menuItem = { displayText: null, url: null, value: null };
      item.displayText = this.translate.instant('pwa.menu.change.number.displaytext');
      item.url = 'changenumber';

      this.commonService.getMsisdnAsObservable()
        .subscribe(msisdn => {
          item.value = msisdn;
        });
      menuSettingsItems.push(item);
    }

    for (let i = 1; i <= menuSettingsItemsSize; i++) {
      let item: menuItem = { displayText: null, url: null, value: null };
      item.displayText = this.translate.instant('pwa.menu.settings.item' + i + '.displaytext');
      item.url = this.translate.instant('pwa.menu.settings.item' + i + '.url');

      if (item.url == "/contestWinnerBoard" || item.url == "/contestPlayWin") {
        if (loggedIn) {
          menuSettingsItems.push(item);
        }
      } else {
        menuSettingsItems.push(item);
      }
    }
    return menuSettingsItems;
  }

  private getMyAccountDetails(myAccountDetails): menuItem {
    let item: menuItem = { displayText: null, url: null, value: null };
    item.displayText = this.translate.instant('pwa.menu.settings.myaccount.displaytext');
    item.url = this.translate.instant('pwa.menu.settings.myaccount.url');
    if (null != myAccountDetails) {
      let unit: string = myAccountDetails.period.unit;
      if (myAccountDetails.period.length > 1) {
        unit = unit + "s";
      }
      let amountValue: any = {};
      let priceWithSymbol = this.commonService.getPriceWithSymbol(myAccountDetails.price.amount, myAccountDetails.price.currency);
      amountValue.amount = priceWithSymbol;
      amountValue.length = myAccountDetails.period.length;
      amountValue.unit = unit;
      item.value = amountValue;
    }
    return item;
  }

  public populateMenuAboutItems(): Promise<any> {
    return this.translate.get('pwa.menu.about.size')
      .toPromise()
      .then(menuAboutItemsSize => {
        let menuAboutItems = [];
        for (let i = 1; i <= menuAboutItemsSize; i++) {
          let item: menuItem = { displayText: null, url: null, value: null };
          item.displayText = this.translate.instant('pwa.menu.about.item' + i + '.displaytext');
          item.url = this.translate.instant('pwa.menu.about.item' + i + '.url');
          menuAboutItems.push(item);
        }
        return menuAboutItems;
      });
  }

  public getContentLanguages(): Observable<any> {
    let params = [];
    return this.httpService.get('getcontentlanguages', params);
  }

  setAccountToggle(value: string) {
    this.accountToggle.next(value);
  }

  getAccountToggle(): Observable<string> {
    return this.accountToggle.asObservable();
  }
}

export class menuItem {
  displayText: string;
  url: string;
  value: any
}
