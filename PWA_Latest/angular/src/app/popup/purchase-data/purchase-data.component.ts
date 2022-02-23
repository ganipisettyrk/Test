import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ClevertapService } from 'src/app/utils/clevertap.service';
import { CommonService } from 'src/app/utils/common.service';
import { CustomTranslateService } from 'src/app/utils/custom-translate.service';
import { ContentService } from '../../content/content.service';
import { GTMService } from '../../utils/gtm.service';
import { PurchaseService } from '../../utils/purchase.service';
import { PopupService } from '../popup.service';

@Component({
  selector: 'app-purchase-data',
  templateUrl: './purchase-data.component.html',
  styleUrls: ['./purchase-data.component.css']
})
export class PurchaseDataComponent implements OnInit {


  @Input() isConsentFlow: boolean;
  @Input() isPaytmFlow: boolean;
  @Input() data: any;
  @Input() isSetForNone: boolean;
  @Input() isMobile: boolean;
  // @Input() shuffleData: any;
  @Output() selectedProfileItem = new EventEmitter<any>();

  caller: any;
  splCaller: any;
  setConfirmCTObj = {};

  showMultipleSubscriptions: boolean = false;
  allowedSubscriptions: any;
  contentMetadata: any;
  selectedSubscription: any = null;

  showSpecialCallerOption: boolean = false;
  priceDescField: string;
  priceDescFieldNewUser: string;
  existingUserPrice: string;
  allCallerChecked: boolean = true;
  splCallerChecked: boolean = false;
  retailPriceId: string = null;
  catalogSubscriptionId: string = "";
  catalogSubscriptionPlanName: string = "";
  isPurchaseError: boolean = false;
  purchaseErrorDesc: string;
  isPurchaseSuccess: boolean = false;
  userStatus: string;

  isNewUser: boolean;
  showPaytmOption = false;

  purchaseDataAvailable: boolean = true;
  purchaseSuccessMsg: string;

  showTNCBoxForPurchase: boolean = false;
  isTnCAutoCheckEnabled: boolean = false;
  isTncChecked: boolean = false;
  showAcceptTncError: boolean = false;
  isDoubleConfirmationRequired: boolean = false;
  doubleConfirmationUserStatus: string;
  showDoubleConfirmationPopup: boolean = false;
  doubleConfirmationPopupData: string;
  newUserDoubleConfirmationData: string;
  existingUserDoubleConfirmationData: string;
  popupDataReady: boolean = false;
  errorMessage: string;
  showPurchaseError = false;
  showSplCallerError = false;
  showProfileDurationError = false;
  invalidProfileDurationError: string;

  //to show if the upgrade popup is enabled or not
  isUpgradePopupEnabled: boolean;
  showUpgradePopup: boolean = false;

  contentId: string;
  contentType: string;
  contentSubtype: string;

  showCrossSellOption = false;
  showConsentResponse: boolean = false;
  consentRespHeading: string;
  consentRespMsg: string;
  consentRespBtnText: string;

  showPaytmResponse = false;
  paytmRespHeading: string;
  paytmRespMsg: string;
  paytmRespBtnText: string;

  profilePrice: string;
  profileDuration: string;
  showProfileOptions: boolean = false;
  isAzaan: boolean = false;
  isContestRedirectRequired: boolean = false;
  isNewUserOffersEnabled: boolean = false;
  newUserPriceDesc = '';

  sliderWidth: string;
  selectedValue = [];

  constructor(public popupService: PopupService, private translate: CustomTranslateService,
    public purchaseService: PurchaseService, private contentService: ContentService,
    private router: Router, public commonService: CommonService,
    private clevertapService: ClevertapService, private gtmService: GTMService,
    private deviceService: DeviceDetectorService) { }

  ngOnInit() {

    this.isAzaan = this.commonService.isAzaan(this.data);
    this.contentId = this.data.id;
    this.contentType = this.data.type;
    this.contentSubtype = this.data.subtype.type;
    this.showSpecialCallerOption = this.translate.instant('pwa.show.special.caller.option') == 'true';
    this.priceDescField = this.translate.instant('pwa.existing.user.price.description.field');
    this.priceDescFieldNewUser = this.translate.instant('pwa.new.user.price.description.field');
    this.showTNCBoxForPurchase = this.translate.instant('pwa.show.tnc.box.for.purchase').trim() == 'true';
    this.isTnCAutoCheckEnabled = this.translate.instant('pwa.autocheck.tnc.box') == 'true';
    if (this.isTnCAutoCheckEnabled) {
      this.isTncChecked = true;
    }
    this.isDoubleConfirmationRequired = this.translate.instant('pwa.purchase.double.confirmation.required') == 'true';
    this.doubleConfirmationUserStatus = this.translate.instant('pwa.purchase.double.confirmation.statuses');
    this.errorMessage = this.translate.instant('pwa.default.error.purchase.prebuy');
    this.invalidProfileDurationError = this.translate.instant('pwa.error.invalid.profile.duration');
    this.isUpgradePopupEnabled = this.translate.instant('pwa.enable.upgrade.popup') == 'true';
    this.isContestRedirectRequired = this.translate.instant('pwa.purchase.success.enable.contest.redirect') == 'true';
    this.isNewUserOffersEnabled = this.translate.instant('pwa.enable.multiple.offers.for.new.user') == 'true';

    if (this.isConsentFlow) {
      this.popupDataReady = true;
      this.showConsentResponse = true;
      if (this.popupService.getPopUpDataItem().response == 'consent_success') {
        this.consentRespHeading = this.translate.instant('pwa.consent.success.page.heading');
        this.consentRespMsg = this.translate.instant('pwa.consent.success.msg.text');
        this.consentRespBtnText = this.translate.instant('pwa.consent.success.btn.text');
      } else {
        this.consentRespHeading = this.translate.instant('pwa.consent.failure.page.heading');
        this.consentRespMsg = this.translate.instant('pwa.consent.failure.msg.text');
        this.consentRespBtnText = this.translate.instant('pwa.consent.failure.btn.text');
      }
    } else if (this.isPaytmFlow) {
      this.popupDataReady = true;
      this.showPaytmResponse = true;
      if (this.popupService.getPopUpDataItem().response == 'paytm_success') {
        this.paytmRespHeading = this.translate.instant('pwa.paytm.success.page.heading');
        this.paytmRespMsg = this.translate.instant('pwa.paytm.success.msg.text');
        this.paytmRespBtnText = this.translate.instant('pwa.paytm.success.btn.text');
      } else if (this.popupService.getPopUpDataItem().response == 'paytm_offline_purchase') {
        this.paytmRespHeading = this.translate.instant('pwa.paytm.offline.cgflow.success.page.heading');
        this.paytmRespMsg = this.translate.instant('pwa.paytm.offline.cgflow.success.page.message');
        this.paytmRespBtnText = this.translate.instant('pwa.paytm.offline.cgflow.success.btn.text');
      } else {
        this.paytmRespHeading = this.translate.instant('pwa.paytm.failure.page.heading');
        this.paytmRespMsg = this.translate.instant('pwa.paytm.failure.msg.text');
        this.paytmRespBtnText = this.translate.instant('pwa.paytm.failure.btn.text');
      }
    } else {
      this.getPurchaseDataDetails();
    }
  }

  private getPurchaseDataDetails(): void {

    // if (this.shuffleData) {
    //   this.contentMetadata = this.shuffleData;
    //   this.getPurchaseDetailsBasedOnUser(this.contentId, this.contentType);
    // }
    // else {
    this.contentService.getContentMetadata(this.contentId, this.contentType, true, this.contentSubtype)
      .subscribe(contentResp => {
        if (null != contentResp && contentResp.status != 'failure') {
          this.contentMetadata = contentResp;
          if (this.contentMetadata.subtype.type == 'ringback_profile') {
            this.showProfileOptions = true;
            this.profilePrice = this.purchaseService.getExistingUserPriceDescription(this.priceDescField, this.contentMetadata);
          }
          this.getPurchaseDetailsBasedOnUser(this.contentId, this.contentType);
        }
        else {
          this.showError("error");
        }
      },
        error => {
          this.showError(error);
        });
  }
  // }

  private getPurchaseDetailsBasedOnUser(contentId, contentType): void {
    let priceDisplayCTEventObj = {};

    this.purchaseService.getUserStatus(false)
      .subscribe(response => {
        if (null != response && response.status != 'failure') {
          this.userStatus = response;
          if (!this.isUserAllowedToPurchase(response)) {
            this.priceDisplay_CTErrorEventUpdate("Purchase Not Allowed");
            this.showPurchaseError = true;
            this.popupDataReady = true;
            return;
          }
          if (this.userStatus == 'new_user') {
            this.isNewUser = true;
            this.caller = 'default';
            let subtype = this.contentMetadata.subtype.type;
            if (this.isNewUserOffersEnabled) {
              this.purchaseService.getPurchaseData(contentId, contentType, subtype)
                .subscribe(resp => {
                  if (null != resp && resp.status != 'failure') {
                    this.popupDataReady = true;
                    if (resp && resp.subscriptions) {
                      this.allowedSubscriptions = resp.subscriptions;
                      this.catalogSubscriptionId = this.allowedSubscriptions[0].catalog_subscription_id;
                      this.retailPriceId = this.allowedSubscriptions[0].song_prices[0].retail_price.id;
                      this.catalogSubscriptionPlanName = this.allowedSubscriptions[0].name;
                      this.selectedValue[0] = true;
                      priceDisplayCTEventObj['Display object'] = 'subscription_and_content';
                      priceDisplayCTEventObj['Display status'] = 'Yes';
                      priceDisplayCTEventObj['Number of plans displayed'] = this.allowedSubscriptions.length;
                      if (this.allowedSubscriptions.length > 1) {
                        let length = this.allowedSubscriptions.length;
                        if (this.isMobile) {
                          this.sliderWidth = (190 * length) + 'px';
                        }
                        else {
                          this.sliderWidth = (180 * length) + 'px';
                        }
                        this.showMultipleSubscriptions = true;
                      } else {
                        this.showMultipleSubscriptions = false;
                        this.selectedSubscription = this.allowedSubscriptions[0];
                      }
                      let planDetails = '';
                      for (let i = 0; i < this.allowedSubscriptions.length; i++) {
                        let count: number = i + 1;
                        if (count != 1) {
                          planDetails = planDetails + ", ";
                        }
                        planDetails = planDetails + this.allowedSubscriptions[i].external_id + ":" + count;
                      }
                      priceDisplayCTEventObj['Plan name and Order'] = planDetails;
                      this.updatePurchaseCTEvent(priceDisplayCTEventObj);

                    }
                  }
                  else {
                    let errorCodeEmptyServiceList = this.translate.instant("pwa.purchase.empty.service.list.error.code");
                    if (resp.code == errorCodeEmptyServiceList) {
                      // When no subscriptions received from getAllowedSubscriptions API
                      this.showMultipleSubscriptions = false;
                      this.purchaseDataAvailable = true;
                      this.popupDataReady = true;
                      this.newUserPriceDesc = this.getNewUserPriceFromContentMetadata(this.contentMetadata);
                      this.catalogSubscriptionId = this.contentMetadata.availability[0].individual[0].catalog_subscription_id;
                      priceDisplayCTEventObj['Display object'] = 'subscription_and_content';
                      priceDisplayCTEventObj['Display status'] = 'Yes';
                      priceDisplayCTEventObj['Number of plans displayed'] = 1;
                      priceDisplayCTEventObj['Plan name and Order'] = this.contentMetadata.availability[0].individual[0].id + ":" + 1;
                      this.updatePurchaseCTEvent(priceDisplayCTEventObj);
                    } else {
                      // console.log('not able to initiate purchase...');
                      this.purchaseDataAvailable = false;
                      this.showError(resp.status);
                    }
                  }
                },
                  error => {
                    this.showError(error);
                  });
            } else {
              this.popupDataReady = true;
              this.showMultipleSubscriptions = false;
              this.purchaseDataAvailable = true;
              this.newUserPriceDesc = this.getNewUserPriceFromContentMetadata(this.contentMetadata);
              this.catalogSubscriptionId = this.contentMetadata.availability[0].individual[0].catalog_subscription_id;
              priceDisplayCTEventObj['Display object'] = 'subscription_and_content';
              priceDisplayCTEventObj['Display status'] = 'Yes';
              priceDisplayCTEventObj['Number of plans displayed'] = 1;
              priceDisplayCTEventObj['Plan name and Order'] = this.contentMetadata.availability[0].individual[0].id + ":" + 1;
              this.updatePurchaseCTEvent(priceDisplayCTEventObj);
            }

          } else {
            this.popupDataReady = true;
            this.isNewUser = false;

            if (this.allCallerChecked) {
              this.caller = 'default';
            }
            priceDisplayCTEventObj['Display object'] = 'content pricing plan';
            priceDisplayCTEventObj['Display status'] = 'Yes';
            priceDisplayCTEventObj['Number of plans displayed'] = 1;
            this.existingUserPrice = this.purchaseService.getExistingUserPriceDescription(this.priceDescField, this.contentMetadata);
            priceDisplayCTEventObj['Plan name and Order'] = this.contentMetadata.availability[0].individual[0].id + ":" + 1;

            if (this.contentMetadata.availability.length > 0
              && this.contentMetadata.availability[0].restrictions
              && this.contentMetadata.availability[0].restrictions.length > 0) {
              //If upgrade
              priceDisplayCTEventObj['Display object'] = 'subscription_and_content';
              priceDisplayCTEventObj['Plan name and Order'] = this.contentMetadata.availability[0].restrictions[0].value + ":" + 1;
              this.catalogSubscriptionId = this.contentMetadata.availability[0].restrictions[0].value;
            }
            this.updatePurchaseCTEvent(priceDisplayCTEventObj);
          }
        }
        else {
          this.showError("error");
        }
      },
        error => {
          this.showError(error);
        });
  }

  private updatePurchaseCTEvent(priceDisplayCTEventObj: any): void {

    this.clevertapService.updateClevertapEvent("Pricing_display", false, null, priceDisplayCTEventObj);
    let gtmEventObj = JSON.parse(JSON.stringify(priceDisplayCTEventObj));
    if (null != gtmEventObj) {
      gtmEventObj['event'] = 'Pricing_display';
      this.gtmService.pushGTMEvent(gtmEventObj, false, 'GTM_Pricing_display');

    }

  }

  private getNewUserPriceFromContentMetadata(contentMetadata: any): string {
    let priceDesc = '';
    if (this.priceDescFieldNewUser == 'short_description') {
      priceDesc = contentMetadata.availability[0].individual[0].short_description;
    } else if (this.priceDescFieldNewUser == 'description') {
      priceDesc = contentMetadata.availability[0].individual[0].description;
    }
    return priceDesc;
  }

  private priceDisplay_CTErrorEventUpdate(error: any) {
    let priceDisplayCTEventObj = {};
    priceDisplayCTEventObj['Display status'] = 'No';
    priceDisplayCTEventObj['failure reason'] = error;
    this.clevertapService.updateClevertapEvent("Pricing_display", false, null, priceDisplayCTEventObj);
    let gtmEventObj = JSON.parse(JSON.stringify(priceDisplayCTEventObj));
    if (null != gtmEventObj) {
      gtmEventObj['event'] = 'Pricing_display';
      this.gtmService.pushGTMEvent(gtmEventObj, false, 'GTM_Pricing_display');
    }
  }

  private showError(error: any): void {
    this.priceDisplay_CTErrorEventUpdate(error);
    this.showPurchaseError = true;
    this.popupDataReady = true;
    return;
  }

  private isUserAllowedToPurchase(user_status): boolean {
    let statusConfig: string = this.translate.instant('pwa.prebuy.blocked.user.statuses');
    if (statusConfig.indexOf(user_status) > -1) {
      this.errorMessage = this.translate.instant('pwa.prebuy.blocked.error.' + user_status);
      return false;
    }
    return true;
  }

  updateTncCheckedValue() {
    this.isTncChecked = !this.isTncChecked;
    this.showAcceptTncError = !this.showAcceptTncError;
  }

  purchaseContent(isUpgradeShown, isDoubleConfirmationShown) {

    this.setConfirmCTObj = JSON.parse(sessionStorage.getItem('SET_CLICK_CT_EVENT_DATA'))
    this.showProfileDurationError = false;
    if (this.allCallerChecked) {
      this.caller = 'default';
      this.setConfirmCTObj['caller'] = 'all';
    } else {
      this.splCaller = this.commonService.getSafeValue(this.splCaller);
      this.caller = this.splCaller;
      this.setConfirmCTObj['caller'] = this.caller;
      let msisdnLength = this.translate.instant('pwa.msisdn.max.length');
      if (!this.caller || this.splCaller.length < msisdnLength) {
        this.showSplCallerError = true;
        return;
      }
    }
    if (this.showTNCBoxForPurchase && !this.isTncChecked) {
      this.showAcceptTncError = true;
      return;
    }
    this.setConfirmCTObj['purchase_plan_id_selected'] = this.catalogSubscriptionId;
    this.setConfirmCTObj['purchase_plan_name_selected'] = this.catalogSubscriptionPlanName;
    this.setConfirmCTObj['user_type'] = this.userStatus;
    this.setConfirmCTObj['user_confirm_status'] = 'confirm';
    if (this.isNewUser) {
      this.setConfirmCTObj['purchase_type'] = 'Subscription and Tune';
    } else {
      this.setConfirmCTObj['purchase_type'] = 'Tune';
    }
    let type = "non_opt_network";
    if (this.isMobile) {
      let wasHeaderUser: boolean = localStorage.getItem("isHeaderUser") == 'true';
      if (wasHeaderUser) {
        type = "opt_network";
      }
    }
    this.setConfirmCTObj['network_type'] = type;

    // upgrade popup
    if (this.isUpgradePopupEnabled && !isUpgradeShown) {
      this.showUpgradePopup = true;
      return;
    } else {
      this.showUpgradePopup = false;
    }

    // double confirmation popup
    if (this.isDoubleConfirmationRequired && !isDoubleConfirmationShown
      && this.doubleConfirmationUserStatus.indexOf(this.userStatus) != -1) {
      this.showDoubleConfirmationPopup = true;
      this.commonService.setHidePopupContentImage(this.showDoubleConfirmationPopup);
      if (isUpgradeShown && !isDoubleConfirmationShown) {
        this.doubleConfirmationPopupData = this.contentMetadata.availability[0].individual[0].description;
      } else {
        this.getDoubleConfirmationPopupData();
      }
      this.setConfirmCTObj['user_consent_type'] = 'inline';
      return;
    } else {
      this.showDoubleConfirmationPopup = false;
      this.commonService.setHidePopupContentImage(this.showDoubleConfirmationPopup);
    }

    sessionStorage.setItem('SET_CONFIRM_CT_EVENT_DATA', JSON.stringify(this.setConfirmCTObj));
    this.clevertapService.updateClevertapEvent("SET_Confirm", false, 'SET_CONFIRM_CT_EVENT_DATA', null);
    let gtmEventObj = JSON.parse(sessionStorage.getItem('SET_CONFIRM_CT_EVENT_DATA'));
    if (null != gtmEventObj) {
      gtmEventObj['event'] = 'SET_Confirm';
      this.gtmService.pushGTMEvent(gtmEventObj, false, 'GTM_SET_Confirm');
    }

    this.popupDataReady = false;

    if (this.retailPriceId == null) {
      this.retailPriceId = this.contentMetadata.availability[0].individual[0].id;
    }
    let subtype = this.contentMetadata.subtype.type;

    this.showPaytmOption = this.translate.instant('pwa.show.paytm.option').trim() == 'true';
    if (this.showPaytmOption && this.isNewUser) {
      this.purchaseService.getPaymentMethods(this.data.id, this.data.type, this.caller,
        this.retailPriceId, subtype, this.catalogSubscriptionId, this.profileDuration)
        .subscribe(response => {
          if (null != response && response.status != 'failure') {
            let resp = JSON.parse(response.result);
            let uniqueId = response.uniqueId;
            this.popupDataReady = true;
            if (resp.billing_types) {
              let thirdPartyUrl = resp.billing_types.third_party_url;
              thirdPartyUrl = thirdPartyUrl.replace('$PWA_PARAMS$', '&pwauid=' + uniqueId + '&pwacid=' + this.data.id + '&pwactype=' + this.data.type);
              sessionStorage.setItem("userPage", this.router.url);
              window.location.href = thirdPartyUrl;
            } else {
              // rest error cases, we should hit combo API
              this.callPurchase(this.retailPriceId, subtype, this.profileDuration);
            }
          } else {
            if (response.subCode == "WALLET_PENDING") {
              this.errorMessage = this.translate.instant('pwa.paytm.wallet.pending.error.msg');
              this.showPurchaseError = true;
              this.popupDataReady = true;
              return;
            } else {
              this.callPurchase(this.retailPriceId, subtype, this.profileDuration);
            }
          }
        },
          error => {
            //continue for combo hit
            this.callPurchase(this.retailPriceId, subtype, this.profileDuration);
          });
    } else {
      this.callPurchase(this.retailPriceId, subtype, this.profileDuration);
    }
  }

  private callPurchase(retailPriceId, subtype, profileDuration): void {
    let purchaseStatusCTObj = {};

    this.purchaseService.purchaseContent(this.data.id, this.data.type, this.caller,
      retailPriceId, subtype, this.catalogSubscriptionId, profileDuration, null, null)
      .subscribe(purchaseResp => {
        purchaseStatusCTObj = JSON.parse(sessionStorage.getItem('SET_CONFIRM_CT_EVENT_DATA'));
        if (purchaseResp && purchaseResp.status == "failure") {
          // console.log('purchase failure!!');
          purchaseStatusCTObj['status'] = 'failure';
          sessionStorage.setItem('SET_PURCHASE_STATUS_CT_EVENT_DATA', JSON.stringify(purchaseStatusCTObj));
          this.clevertapService.updateClevertapEvent("Purchase_status", false, 'SET_PURCHASE_STATUS_CT_EVENT_DATA', null);
          let gtmEventObj = JSON.parse(sessionStorage.getItem('SET_PURCHASE_STATUS_CT_EVENT_DATA'));
          if (null != gtmEventObj) {
            gtmEventObj['event'] = 'Purchase_status';
            this.gtmService.pushGTMEvent(gtmEventObj, false, 'GTM_Purchase_status');
          }
          this.popupDataReady = true;
          this.isPurchaseError = true;
          this.purchaseErrorDesc = purchaseResp.description;
        } else {
          // console.log('purchase success!!');
          let offlineRUrlStatusCode = this.translate.instant('pwa.offline.rurl.success.response.status_code');
          let offlineRUrlMessage = this.translate.instant('pwa.offline.rurl.success.response.message');
          if (purchaseResp.thirdpartyconsent) {
            let consentPageUrl = purchaseResp.thirdpartyconsent.third_party_url;
            if (consentPageUrl.includes('msisdn')) {
              let strArr: string[] = consentPageUrl.split('&');
              for (let i = 0; i < strArr.length; i++) {
                let paramKey = strArr[i].split('=')[0];
                let paramVal = strArr[i].split(/=(.+)/)[1]; //split by this regex will include '=' in paramVal if any present already
                if (paramKey == 'msisdn') {
                  let encodedMsisdn = encodeURIComponent(paramVal);
                  consentPageUrl = consentPageUrl.replace(paramVal, encodedMsisdn);
                }
              }
            }

            let consentReturnUrl = this.translate.instant('pwa.consent.return.url');
            if (consentReturnUrl.indexOf("?") == -1) {
              consentReturnUrl += "?";
            }
            if (consentReturnUrl.indexOf("&") == -1) {
              consentReturnUrl += "contentId="
            } else {
              consentReturnUrl += "&contentId="
            }
            consentReturnUrl += this.contentId + "&contentType=" + this.contentType;
            consentPageUrl = consentPageUrl.replace("$[CG_RETURN_URL]", consentReturnUrl);

            sessionStorage.setItem("currentPage", this.router.url);
            sessionStorage.setItem("rUrl", purchaseResp.thirdpartyconsent.return_url);
            sessionStorage.setItem("contentId", this.contentId);
            sessionStorage.setItem("contentType", this.contentType);
            sessionStorage.setItem('SET_PURCHASE_STATUS_CT_EVENT_DATA', JSON.stringify(purchaseStatusCTObj));
            this.clevertapService.updateClevertapEvent("Purchase_status", false, 'SET_PURCHASE_STATUS_CT_EVENT_DATA', null);
            this.setConfirmCTObj['user_consent_type'] = 'online';
            let gtmEventObj = JSON.parse(sessionStorage.getItem('SET_PURCHASE_STATUS_CT_EVENT_DATA'));
            if (null != gtmEventObj) {
              gtmEventObj['event'] = 'Purchase_status';
              this.gtmService.pushGTMEvent(gtmEventObj, false, 'GTM_Purchase_status');
            }
            window.location.href = consentPageUrl;

          } else if (purchaseResp.playrule && (purchaseResp.playrule.id ||
            (purchaseResp.playrule.status && purchaseResp.playrule.status.toLowerCase() == "consent_pending"))) {
            this.popupDataReady = true;
            this.isPurchaseSuccess = true;
            this.updateLatestPurchase(this.contentId); // updating the latest purchased rbt id to already purchased rbt ids.
            this.getCrossSellOption(this.contentMetadata);
            purchaseStatusCTObj['status'] = 'success';
            this.setConfirmCTObj['user_consent_type'] = 'no 2nd consent';
            sessionStorage.setItem('SET_PURCHASE_STATUS_CT_EVENT_DATA', JSON.stringify(purchaseStatusCTObj));
            this.clevertapService.updateClevertapEvent("Purchase_status", false, 'SET_PURCHASE_STATUS_CT_EVENT_DATA', null);
            let gtmEventObj = JSON.parse(sessionStorage.getItem('SET_PURCHASE_STATUS_CT_EVENT_DATA'));
            if (null != gtmEventObj) {
              gtmEventObj['event'] = 'Purchase_status';
              this.gtmService.pushGTMEvent(gtmEventObj, false, 'GTM_Purchase_status');
            }
            /*if (this.caller == 'default') {
              // In MWeb we are showing postbuy msg from postbuy param
              this.purchaseSuccessMsg = this.translate.instant('pwa.allcaller.purchase.success.msg');
            } else {
              this.purchaseSuccessMsg = this.translate.instant('pwa.splcaller.purchase.success.msg');
              this.purchaseSuccessMsg = this.purchaseSuccessMsg.replace('%CALLER%', this.caller);
            }*/
            this.purchaseSuccessMsg = this.getPurchaseSuccessMsg();
            this.commonService.setCTWithMyAccountStatus(true);
          } else if (purchaseResp.status_code && purchaseResp.status_code == offlineRUrlStatusCode
            && purchaseResp.message == offlineRUrlMessage) {
            this.popupDataReady = true;
            this.isPurchaseSuccess = true;
            this.updateLatestPurchase(this.contentId);
            this.getCrossSellOption(this.contentMetadata);
            this.purchaseSuccessMsg = this.translate.instant('pwa.purchase.success.message.for.offline.cgflow');
            purchaseStatusCTObj['status'] = 'success';
            sessionStorage.setItem('SET_PURCHASE_STATUS_CT_EVENT_DATA', JSON.stringify(purchaseStatusCTObj));
            this.clevertapService.updateClevertapEvent("Purchase_status", false, 'SET_PURCHASE_STATUS_CT_EVENT_DATA', null);
            let gtmEventObj = JSON.parse(sessionStorage.getItem('SET_PURCHASE_STATUS_CT_EVENT_DATA'));
            if (null != gtmEventObj) {
              gtmEventObj['event'] = 'Purchase_status';
              this.gtmService.pushGTMEvent(gtmEventObj, false, 'GTM_Purchase_status');
            }
            this.commonService.setCTWithMyAccountStatus(true);
          }
          else {
            this.popupDataReady = true;
            this.isPurchaseError = true;
            // error case should be handled

            purchaseStatusCTObj['status'] = 'failure';
            sessionStorage.setItem('SET_PURCHASE_STATUS_CT_EVENT_DATA', JSON.stringify(purchaseStatusCTObj));
            this.clevertapService.updateClevertapEvent("Purchase_status", false, 'SET_PURCHASE_STATUS_CT_EVENT_DATA', null);
            let gtmEventObj = JSON.parse(sessionStorage.getItem('SET_PURCHASE_STATUS_CT_EVENT_DATA'));
            if (null != gtmEventObj) {
              gtmEventObj['event'] = 'Purchase_status';
              this.gtmService.pushGTMEvent(gtmEventObj, false, 'GTM_Purchase_status');
            }
          }

          sessionStorage.setItem('SET_SECOND_CONSENT_CT_EVENT_DATA', JSON.stringify(this.setConfirmCTObj));
          this.clevertapService.updateClevertapEvent("Set_Second_Consent", false, 'SET_SECOND_CONSENT_CT_EVENT_DATA', null);
          let gtmEventObj = JSON.parse(sessionStorage.getItem('SET_SECOND_CONSENT_CT_EVENT_DATA'));
          if (null != gtmEventObj) {
            gtmEventObj['event'] = 'Set_Second_Consent';
            this.gtmService.pushGTMEvent(gtmEventObj, false, 'GTM_Set_Second_Consent');
          }
        }
      },
        error => {
          this.popupDataReady = true;
          this.isPurchaseError = true;
          this.purchaseErrorDesc = this.translate.instant('pwa.default.error.purchase.failure');
          // console.log('something went wrong while purchasing');
          purchaseStatusCTObj['status'] = 'failure';
          sessionStorage.setItem('SET_PURCHASE_STATUS_CT_EVENT_DATA', JSON.stringify(purchaseStatusCTObj));
          this.clevertapService.updateClevertapEvent("Purchase_status", false, 'SET_PURCHASE_STATUS_CT_EVENT_DATA', null);
          let gtmEventObj = JSON.parse(sessionStorage.getItem('SET_PURCHASE_STATUS_CT_EVENT_DATA'));
          if (null != gtmEventObj) {
            gtmEventObj['event'] = 'Purchase_status';
            this.gtmService.pushGTMEvent(gtmEventObj, false, 'GTM_Purchase_status');
          }
        });
  }

  private getPurchaseSuccessMsg(): string {
    if (this.isNewUser && this.isNewUserOffersEnabled && null != this.selectedSubscription) {
      return this.getNewUserPurchaseSuccessMsg(this.selectedSubscription);
    } else {
      return this.getExistingUserPurchaseSuccessMsg(this.contentMetadata);
    }
  }

  private getNewUserPurchaseSuccessMsg(subscription: any): string {
    let msg = null;
    if (subscription.retail_price.postBuyDescription != null &&
      subscription.retail_price.postBuyShortDescription != null) {
      let priceDescParam = this.translate.instant('pwa.postbuy.description.param');
      if (priceDescParam === 'postBuyShortDescription') {
        msg = subscription.retail_price.postBuyShortDescription;
      } else {
        msg = subscription.retail_price.postBuyDescription;
      }
    }
    if (msg == null) {
      msg = this.getDefaultPurchaseSuccessMsg();
    }
    return msg;
  }

  private getExistingUserPurchaseSuccessMsg(contentObj: any): string {
    let msg = null;
    if (contentObj.availability && contentObj.availability[0].individual
      && contentObj.availability[0].individual[0].postBuyDescription != null
      && contentObj.availability[0].individual[0].postBuyShortDescription != null) {
      let priceDescParam = this.translate.instant('pwa.postbuy.description.param');
      if (priceDescParam === 'postBuyShortDescription') {
        msg = contentObj.availability[0].individual[0].postBuyShortDescription;
      } else {
        msg = contentObj.availability[0].individual[0].postBuyDescription;
      }
    }
    if (msg == null) {
      msg = this.getDefaultPurchaseSuccessMsg();
    }
    return msg;
  }

  private getDefaultPurchaseSuccessMsg(): string {
    let defaultMsg;
    if (this.caller == 'default') {
      defaultMsg = this.translate.instant('pwa.allcaller.purchase.success.msg');
    } else {
      defaultMsg = this.translate.instant('pwa.splcaller.purchase.success.msg');
      defaultMsg = defaultMsg.replace('%CALLER%', this.caller);
    }
    return defaultMsg;
  }

  private getCrossSellOption(item) {
    let showCrossSell = this.translate.instant('pwa.enable.rbt-rt.cross.sell').trim() == 'true';
    let rtForDesktop = this.translate.instant("pwa.disable.rt.for.desktop").trim() == 'true';
    let disableRT: boolean = false;
    if (this.deviceService.isDesktop() && rtForDesktop) {
      disableRT = true;
    }
    let purchasedRTIds = this.commonService.getPurchasedRealtoneIds();
    if (null == purchasedRTIds) {
      purchasedRTIds = [];
    }
    if (showCrossSell && !disableRT && purchasedRTIds.indexOf(item.realtone.id) <= -1
      && item.realtone.purchase_allowed && item.realtone.preview_allowed) {
      this.showCrossSellOption = true;
    } else {
      this.showCrossSellOption = false;
    }
  }

  private updateLatestPurchase(contentId) {
    let purchasedRbtIds = this.commonService.getPurchasedRingBackIds();
    if (null == purchasedRbtIds) {
      purchasedRbtIds = [];
    }
    purchasedRbtIds.push(contentId);
    this.commonService.setPurchasedRingBackIds(purchasedRbtIds);
  }

  disableAllCaller() {
    this.commonService.updateFieldsInSpecialCaller();
    this.allCallerChecked = !this.allCallerChecked;
    this.splCallerChecked = !this.splCallerChecked;
  }

  disableSplCaller() {
    this.commonService.updateFieldsInAllCaller();
    this.allCallerChecked = !this.allCallerChecked;
    this.splCallerChecked = !this.splCallerChecked;
  }

  onRadioChange(index) {
    this.catalogSubscriptionId = this.allowedSubscriptions[index].catalog_subscription_id;
    this.retailPriceId = this.allowedSubscriptions[index].song_prices[0].retail_price.id;
    this.selectedValue[index] = true;

    for (let i = 0; i < this.allowedSubscriptions.length; i++) {
      if (i != index) {
        if (this.selectedValue[i]) {
          this.selectedValue[i] = !this.selectedValue[i];
        }
      }
    }
    let subscription: any = this.allowedSubscriptions[index];
    this.catalogSubscriptionPlanName = subscription.name;
    this.newUserDoubleConfirmationData = this.purchaseService.getNewUserPriceDescription(this.priceDescFieldNewUser, subscription);
    this.selectedSubscription = subscription;
  }

  private getDoubleConfirmationPopupData() {
    if (!this.isNewUser) {
      this.doubleConfirmationPopupData = this.existingUserPrice;
    } else {
      if (this.isNewUserOffersEnabled) {
        if (!this.showMultipleSubscriptions) {
          this.doubleConfirmationPopupData = this.purchaseService.getNewUserPriceDescription
            (this.priceDescFieldNewUser, this.allowedSubscriptions[0]);
        }
        else {
          this.doubleConfirmationPopupData = this.newUserDoubleConfirmationData;
        }
      } else {
        this.doubleConfirmationPopupData = this.newUserPriceDesc;
      }
    }
  }

  updateProfileDurationSelected(event: any) {
    this.profileDuration = event;
  }

  goToUrl(): void {
    let url = this.translate.instant("pwa.purchase.go.to.home.button.click.url");
    this.popupService.closePopup();
    this.commonService.goToURL(url);
  }

  goToContestPage(): void {
    this.commonService.redirectToContest('/contestPlayWin');
  }

  updateCatalogSubsId(value: string) {
    if (value) {
      this.catalogSubscriptionId = value;
    }
  }
}
