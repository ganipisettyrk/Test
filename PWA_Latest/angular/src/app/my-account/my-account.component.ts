import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';
import { MenuService } from '../header/menu/menu.service';
import { CommonService } from '../utils/common.service';
import { CustomTranslateService } from '../utils/custom-translate.service';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.css']
})

export class MyAccountComponent implements OnInit {

  myAccount: any;
  myRTAccount: any;
  accountDetails: any;

  showDisclaimer: boolean = false;
  showRTDisclaimer: boolean = false;

  activePlan: string;
  activePlanRT: string;
  dateFormat: string;
  showRTToggle: boolean = false;
  toggleValue = 'ct';
  showDisabledUserMsg = false;
  disabledStatusMsg: string;

  constructor(private translate: CustomTranslateService, private commonService: CommonService,
    private router: Router, private menuService: MenuService, private deviceService: DeviceDetectorService,
    private datePipe: DatePipe, private titleCasePipe: TitleCasePipe) { }

  ngOnInit() {

    this.commonService.isUserLoggedIn()
      .subscribe((isLoggedIn: boolean) => {
        if (!isLoggedIn) {
          // If the user not logged in and trying to access feedback page, will redirect him to home page.
          this.router.navigateByUrl('/home');
        }
        else {
          this.getAccountDetails();
        }
      });

    this.menuService.getAccountToggle()
      .subscribe(resp => {
        this.toggleValue = resp;
        if (resp == 'rt') {
          this.getRTAccountDetails();
        } else {
          this.getAccountDetails();
        }
      });

    setTimeout(() => {
      this.commonService.setFooterDisplayStatus(true);
    }, 2);
  }

  private getAccountDetails(): void {
    let myAccountDetails = JSON.parse(sessionStorage.getItem("PlanDetails"));
    this.translate.get("pwa.myaccount.enable.disclaimer.text").subscribe(res => {
      let disabledSubscriptionStatus = this.translate.instant('pwa.myaccount.disable.for.status');
      if (this.myAccount) {
        if (myAccountDetails && !(disabledSubscriptionStatus.includes(myAccountDetails.Subscription_status))) {
          this.accountDetails = this.myAccount;
          this.showDisabledUserMsg = false;
          return;
        } else {
          this.showDisabledUserMsg = true;
          this.myAccount = this.showDisabledUserMsg;
          this.disabledStatusMsg = this.translate.instant('pwa.myaccount.' + myAccountDetails.Subscription_status + '.text');
          return;
        }
      }

      if (res) {
        this.showDisclaimer = (res.trim() == 'true');
      }
      let rtToggle = this.translate.instant("pwa.myaccount.enable.rt.toggle").trim() == 'true';
      let rtToggleForDesktop = this.translate.instant("pwa.disable.rt.for.desktop").trim() == 'true';
      if (rtToggle) {
        if ((this.deviceService.isMobile() && this.deviceService.os == 'Android') || (this.deviceService.isTablet() && this.deviceService.os == 'Android')
          || (this.deviceService.isDesktop() && !rtToggleForDesktop && this.deviceService.os != 'Mac')) {
          this.showRTToggle = true;
        }
        this.showRTDisclaimer = this.translate.instant("pwa.rt.myaccount.enable.disclaimer.text").trim() == 'true';
      }
      this.dateFormat = this.translate.instant("pwa.myaccount.subscription.date.format");
      let showAccount = this.translate.instant('pwa.menu.settings.enable.myaccount') == "true";

      let subsPriceText = this.translate.instant('pwa.myaccount.subscription.price.text');
      let selPriceText = this.translate.instant('pwa.myaccount.song.selection.price.text');
      let validityText = this.translate.instant('pwa.myaccount.validity.text');
      let nextSubsText = this.translate.instant('pwa.myaccount.next.subscription.text');
      let lastSubsText = this.translate.instant('pwa.myaccount.last.subscription.text');

      if (disabledSubscriptionStatus.includes(myAccountDetails.Subscription_status)) {
        this.showDisabledUserMsg = true;
        this.myAccount = this.showDisabledUserMsg;
        this.disabledStatusMsg = this.translate.instant('pwa.myaccount.' + myAccountDetails.Subscription_status + '.text');
      } else {
        if (myAccountDetails && showAccount) {
          this.showDisabledUserMsg = false;
          this.activePlan = myAccountDetails.activePlan;
          let subsPrice = this.commonService.getPriceWithSymbol(myAccountDetails.price.amount, myAccountDetails.price.currency);
          let selPrice = '0';
          if (myAccountDetails.songSelectionPrice) {
            selPrice = this.commonService.getPriceWithSymbol(myAccountDetails.songSelectionPrice.amount, myAccountDetails.songSelectionPrice.currency);
          }

          let validity = this.getValidity(myAccountDetails.period.length, myAccountDetails.period.unit);
          let nextSubsDate = this.formatDate(myAccountDetails.nextSubscription);
          let lastSubsDate = this.formatDate(myAccountDetails.lastSubscription);

          let accountObj = [];
          accountObj.push({ key: subsPriceText, value: subsPrice });
          accountObj.push({ key: selPriceText, value: selPrice });
          accountObj.push({ key: validityText, value: validity });
          accountObj.push({ key: nextSubsText, value: nextSubsDate });
          accountObj.push({ key: lastSubsText, value: lastSubsDate });
          this.myAccount = accountObj;
          this.accountDetails = this.myAccount;

        } else {
          this.myAccount = null;
          this.accountDetails = this.myAccount;
        }
      }
    });
  }

  private getRTAccountDetails() {

    let rtuserStatus = this.commonService.getRtUserStatus();
    let RTAccountDetails = sessionStorage.getItem("RTPlanDetails");
    let myAccountRTDetails = null;
    if (RTAccountDetails != null && RTAccountDetails != "{}") {
      myAccountRTDetails = JSON.parse(sessionStorage.getItem("RTPlanDetails"));
    }
    let disabledSubscriptionStatus = this.translate.instant('pwa.rt.myaccount.disable.for.status');

    if (this.myRTAccount) {
      if (!disabledSubscriptionStatus.includes(rtuserStatus)) {
        this.accountDetails = this.myRTAccount;
        this.showDisabledUserMsg = false;
        return;
      } else {
        this.showDisabledUserMsg = true;
        this.myRTAccount = this.showDisabledUserMsg;
        this.disabledStatusMsg = this.translate.instant('pwa.rt.myaccount.' + rtuserStatus + '.text');
        return;
      }
    }

    if (disabledSubscriptionStatus.includes(rtuserStatus)) {
      this.showDisabledUserMsg = true;
      this.myRTAccount = this.showDisabledUserMsg;
      this.disabledStatusMsg = this.translate.instant('pwa.rt.myaccount.' + rtuserStatus + '.text');

    } else {
      if (myAccountRTDetails) {
        this.showDisabledUserMsg = false;
        this.activePlanRT = myAccountRTDetails.activePlan;
        let subsPriceText = this.translate.instant('pwa.rt.myaccount.subscription.price.text');
        let validityText = this.translate.instant('pwa.rt.myaccount.validity.text');
        let nextSubsText = this.translate.instant('pwa.rt.myaccount.next.subscription.text');
        let lastSubsText = this.translate.instant('pwa.rt.myaccount.last.subscription.text');
        let countText = this.translate.instant('pwa.rt.myaccount.total.download.count.text');
        let availableText = this.translate.instant('pwa.rt.myaccount.available.downloads.text');

        let subsPrice = this.commonService.getPriceWithSymbol(myAccountRTDetails.price.amount, myAccountRTDetails.price.currency);

        let validity = this.getValidity(myAccountRTDetails.period.length, myAccountRTDetails.period.unit);
        let nextSubsDate = this.formatDate(myAccountRTDetails.nextSubscription);
        let lastSubsDate = this.formatDate(myAccountRTDetails.lastSubscription)
        let count = myAccountRTDetails.count;
        let available = myAccountRTDetails.available_downloads;

        let rtAccountObj = [];
        rtAccountObj.push({ key: subsPriceText, value: subsPrice });
        rtAccountObj.push({ key: validityText, value: validity });
        rtAccountObj.push({ key: nextSubsText, value: nextSubsDate });
        rtAccountObj.push({ key: lastSubsText, value: lastSubsDate });
        rtAccountObj.push({ key: countText, value: count });
        rtAccountObj.push({ key: availableText, value: available });
        this.myRTAccount = rtAccountObj;
        this.accountDetails = this.myRTAccount;
      }
      else {
        this.myRTAccount = null;
        this.accountDetails = this.myRTAccount;
      }
    }
  }

  private formatDate(date) {
    if (date != null) {
      date = date.replace(/-/g, '/');
      return this.datePipe.transform(date, this.dateFormat);
    } else {
      return '';
    }
  }



  private getValidity(length, unit): string {
    if (length > 1) {
      unit = unit + "s";
      unit = this.titleCasePipe.transform(unit);
    }
    return length + " " + unit;
  }
}

