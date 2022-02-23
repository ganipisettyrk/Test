import { Component, Input, OnInit } from '@angular/core';
import { ContentService } from 'src/app/content/content.service';
import { ClevertapService } from 'src/app/utils/clevertap.service';
import { CommonService } from 'src/app/utils/common.service';
import { CustomTranslateService } from 'src/app/utils/custom-translate.service';
import { GTMService } from 'src/app/utils/gtm.service';
import { HttpRequestService } from 'src/app/utils/http-request.service';
import { PurchaseService } from 'src/app/utils/purchase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rt-purchase-data',
  templateUrl: './rt-purchase-data.component.html',
  styleUrls: ['./rt-purchase-data.component.css']
})

export class RtPurchaseDataComponent implements OnInit {

  @Input() data: any;
  @Input() isMobile: boolean;

  isDataReady = false;
  conditionsToHitAllowedSubscription: string;
  purchaseRespHeading: string;
  purchaseRespDesc: string;
  purchaseRespPopupBtnTxt: string;
  priceDescField: string;
  priceDescFieldNewUser: string;
  existingUserPrice: string;
  showExistingUserPrice = false;
  contentMetadata: any;
  catalogSubscriptionId: string = '';

  showRTPurchaseResp = false;
  showCrossSellOption = false;
  selectionExists = false;
  allowedSubscriptions: any;
  showMultipleSubscriptions = false;
  selectedValue = [];
  sliderWidth: string;
  purchaseFailureHeading: string;

  constructor(private contentService: ContentService, private translate: CustomTranslateService,
    public commonService: CommonService, public purchaseService: PurchaseService,
    private clevertapService: ClevertapService, private gtmService: GTMService,
    private httpService: HttpRequestService, private router: Router) { }

  ngOnInit() {

    let contentId = this.data.id;
    let subtype = this.data.subtype.type;
    this.conditionsToHitAllowedSubscription = this.translate.instant('pwa.rt.state.for.allowed.subscription');
    this.priceDescFieldNewUser = this.translate.instant('pwa.new.user.price.description.field');
    this.priceDescField = this.translate.instant('pwa.existing.user.price.description.field');
    this.purchaseFailureHeading = this.translate.instant('pwa.rt.purchase.failure.heading');
    this.purchaseRespPopupBtnTxt = this.translate.instant('pwa.rt.purchase.failure.popup.button.text');
    this.getRTPurchaseDataDetails(contentId, subtype);
  }

  private getRTPurchaseDataDetails(contentId: string, subtype: string) {
    let priceDisplayCTEventObj = {};

    this.contentService.getContentMetadata(contentId, 'realtone', true)
      .subscribe(resp => {
        if (resp && resp.status != 'failure') {
          this.contentMetadata = resp;
          if (resp.availability && resp.availability[0] && resp.availability[0].restrictions
            && resp.availability[0].restrictions.length > 0) {
            let condition = resp.availability[0].restrictions[0].condition.toUpperCase();
            let prevSubsInProgressText = this.translate.instant('pwa.rt.previous.subscription.inprogress.state.text');

            if (prevSubsInProgressText.indexOf(condition) > -1) {
              this.isDataReady = true;
              this.showRTPurchaseResp = true;
              this.purchaseRespHeading = this.purchaseFailureHeading;
              this.purchaseRespDesc = this.translate.instant('pwa.rt.purchase.failure.previous.pending.description');
              this.priceDisplay_CTErrorEventUpdate('RT_prev_req_pending');
            }
            else if (this.conditionsToHitAllowedSubscription.indexOf(condition) > -1) {
              // we hit getAllowedSubscriptions
              this.purchaseService.getPurchaseData(contentId, 'realtone', subtype)
                .subscribe(resp => {
                  if (null != resp && resp.status != 'failure') {
                    this.isDataReady = true;
                    if (resp && resp.subscriptions) {
                      this.allowedSubscriptions = resp.subscriptions;
                      this.catalogSubscriptionId = this.allowedSubscriptions[0].catalog_subscription_id;
                      if (this.allowedSubscriptions.length > 1) {
                        let length = this.allowedSubscriptions.length;
                        if (this.isMobile) {
                          this.sliderWidth = (190 * length) + 'px';
                        } else {
                          this.sliderWidth = (180 * length) + 'px';
                        }
                        this.showMultipleSubscriptions = true;
                        this.selectedValue[0] = true;
                      } else {
                        this.showMultipleSubscriptions = false;
                      }
                      priceDisplayCTEventObj['Display object'] = 'subscription_and_content';
                      priceDisplayCTEventObj['Display status'] = 'Yes';
                      priceDisplayCTEventObj['Number of plans displayed'] = this.allowedSubscriptions.length;
                      let planDetails = '';
                      for (let i = 0; i < this.allowedSubscriptions.length; i++) {
                        let count: number = i + 1;
                        if (count != 1) {
                          planDetails = planDetails + ", ";
                        }
                        planDetails = planDetails + this.allowedSubscriptions[i].external_id + ":" + count;
                      }
                      priceDisplayCTEventObj['Plan name and Order'] = planDetails;
                      this.clevertapService.updateClevertapEvent("RT_Pricing_display", false, null, priceDisplayCTEventObj);
                      let gtmEventObj = JSON.parse(JSON.stringify(priceDisplayCTEventObj));
                      if (null != gtmEventObj) {
                        gtmEventObj['event'] = 'RT_Pricing_display';
                        this.gtmService.pushGTMEvent(gtmEventObj, false, 'GTM_RT_Pricing_display');
                      }
                    }
                  } else {
                    // error page due to failure in allowed subscriptions hit
                    this.isDataReady = true;
                    this.showRTPurchaseResp = true;
                    this.purchaseRespHeading = this.purchaseFailureHeading;
                    this.purchaseRespDesc = resp.description;
                    this.priceDisplay_CTErrorEventUpdate(resp.code);
                  }
                },
                  error => {
                    //redirect to error page.
                    // this.router.navaigateByUrl('/error');
                  });
            }
          } else {
            this.isDataReady = true;
            this.showExistingUserPrice = true;
            this.catalogSubscriptionId = this.commonService.getRtCatalogSubscriptionId();
            //catalogSubscriptionId is null in case of non-logged in user hitting get button.
            if (this.catalogSubscriptionId == null) {
              let params = [];
              params.push({ paramName: 'isRTContent', paramValue: true });
              this.httpService.get('getusersubscription', params)
                .subscribe((resp: any) => {
                  if (resp && resp.length > 0) {
                    this.catalogSubscriptionId = resp[0].catalog_subscription_id;
                  }
                },
                  error => {

                  });
            }
            this.existingUserPrice = this.purchaseService.getExistingUserPriceDescription(this.priceDescField, resp);
            priceDisplayCTEventObj['Display object'] = 'content pricing plan';
            priceDisplayCTEventObj['Display status'] = 'Yes';
            priceDisplayCTEventObj['Number of plans displayed'] = 1;
            // priceDisplayCTEventObj['Plan name and Order'] = this.contentMetadata.availability[0].individual[0].id + ":" + 1;
            this.clevertapService.updateClevertapEvent("RT_Pricing_display", false, null, priceDisplayCTEventObj);
            let gtmEventObj = JSON.parse(JSON.stringify(priceDisplayCTEventObj));
            if (null != gtmEventObj) {
              gtmEventObj['event'] = 'RT_Pricing_display';
              this.gtmService.pushGTMEvent(gtmEventObj, false, 'GTM_RT_Pricing_display');
            }
          }
        } else {
          this.isDataReady = true;
          this.showRTPurchaseResp = true;
          this.purchaseRespHeading = this.translate.instant('pwa.rt.purchase.failure.heading');
          this.purchaseRespDesc = resp.description;
          this.priceDisplay_CTErrorEventUpdate(resp.code);
        }
      }, error => {
        this.router.navigateByUrl('/error');
      })
  }

  onRadioChange(index) {
    this.catalogSubscriptionId = this.allowedSubscriptions[index].catalog_subscription_id;
    this.selectedValue[index] = true;

    for (let i = 0; i < this.allowedSubscriptions.length; i++) {
      if (i != index) {
        if (this.selectedValue[i]) {
          this.selectedValue[i] = !this.selectedValue[i];
        }
      }
    }
  }

  private priceDisplay_CTErrorEventUpdate(error: any) {
    let priceDisplayCTEventObj = {};
    priceDisplayCTEventObj['Display status'] = 'No';
    priceDisplayCTEventObj['failure reason'] = error;
    this.clevertapService.updateClevertapEvent("RT_Pricing_display", false, null, priceDisplayCTEventObj);
    let gtmEventObj = JSON.parse(JSON.stringify(priceDisplayCTEventObj));
    if (null != gtmEventObj) {
      gtmEventObj['event'] = 'RT_Pricing_display';
      this.gtmService.pushGTMEvent(gtmEventObj, false, 'GTM_RT_Pricing_display');
    }
  }

  purchaseRTContent() {
    let rtSetConfirmObj = {};

    let subtype = this.contentMetadata.subtype.type;
    let contentId = this.contentMetadata.id;
    let madeRefId = this.contentMetadata.realtone.made_reference_id;
    let madeContext = this.contentMetadata.realtone.made_context;

    rtSetConfirmObj['tune_id'] = contentId;
    rtSetConfirmObj['tune_type'] = 'realtone';
    rtSetConfirmObj['tune_name'] = this.contentMetadata.track_name;
    rtSetConfirmObj['tune_subtype'] = this.contentMetadata.subtype.type;
    this.clevertapService.updateClevertapEvent("RT_SET_Confirm", false, null, rtSetConfirmObj);
    let gtmEventObj = rtSetConfirmObj;
    if (null != gtmEventObj) {
      gtmEventObj['event'] = 'SET_Confirm';
      this.gtmService.pushGTMEvent(gtmEventObj, false, 'GTM_RT_SET_Confirm');
    }

    let purchaseStatusCTObj = {};
    this.purchaseService.purchaseContent(contentId, 'realtone', 'default',
      null, subtype, this.catalogSubscriptionId, null, madeRefId, madeContext)
      .subscribe(purchaseResp => {
        this.isDataReady = true;
        if (purchaseResp && purchaseResp.status == "failure") {
          purchaseStatusCTObj['status'] = 'failure';
          this.clevertapService.updateClevertapEvent("Purchase_status", false, null, purchaseStatusCTObj);
          let gtmEventObj = purchaseStatusCTObj;
          gtmEventObj['event'] = 'Purchase_status';
          this.gtmService.pushGTMEvent(gtmEventObj, false, 'GTM_Purchase_status');

          this.showRTPurchaseResp = true;
          this.purchaseRespHeading = this.purchaseFailureHeading;
          this.purchaseRespDesc = purchaseResp.description;
        } else {
          purchaseStatusCTObj['status'] = 'success';
          this.clevertapService.updateClevertapEvent("Purchase_status", false, null, purchaseStatusCTObj);
          let gtmEventObj = purchaseStatusCTObj;
          gtmEventObj['event'] = 'Purchase_status';
          this.gtmService.pushGTMEvent(gtmEventObj, false, 'GTM_Purchase_status');

          this.showRTPurchaseResp = true;
          this.purchaseRespHeading = this.translate.instant('pwa.rt.purchase.success.heading');
          this.purchaseRespDesc = this.translate.instant('pwa.rt.purchase.success.description');
          this.purchaseRespPopupBtnTxt = this.translate.instant('pwa.rt.purchase.success.popup.button.text');
          this.updateLatestRTPurchaseId(contentId);
          let userPurchasedRbtIds = this.commonService.getPurchasedRingBackIds();
          let showCrossSell = this.translate.instant('pwa.enable.rt-rbt.cross.sell').trim() == 'true';
          if (showCrossSell && null == userPurchasedRbtIds) {
            this.showCrossSellOption = true;
          } else if (showCrossSell && userPurchasedRbtIds.indexOf(this.contentMetadata.ringback.id) <= -1
            && this.contentMetadata.ringback.purchase_allowed && this.contentMetadata.ringback.preview_allowed) {
            this.showCrossSellOption = true;
          } else {
            this.showCrossSellOption = false;
          }
          this.commonService.setCTWithRTMyAccountStatus(true);
          let downloadUrl: string = purchaseResp.purchase.download_url;
          let token: string = purchaseResp.cred_token;
          window.location.href = downloadUrl + '&cred.token=' + token;
        }
      },
        error => {
          this.isDataReady = true;
          this.showRTPurchaseResp = true;
          this.purchaseRespHeading = this.purchaseFailureHeading;
          this.purchaseRespDesc = this.translate.instant('pwa.rt.purchase.generic.failure.description');
          purchaseStatusCTObj['status'] = 'failure';
          this.clevertapService.updateClevertapEvent("Purchase_status", false, null, purchaseStatusCTObj);
          let gtmEventObj = purchaseStatusCTObj;
          gtmEventObj['event'] = 'Purchase_status';
          this.gtmService.pushGTMEvent(gtmEventObj, false, 'GTM_Purchase_status');
        });
  }

  private updateLatestRTPurchaseId(contentId) {
    let purchasedRtIds = this.commonService.getPurchasedRealtoneIds();
    if (null == purchasedRtIds) {
      purchasedRtIds = [];
    }
    purchasedRtIds.push(contentId);
    this.commonService.setPurchasedRealtoneIds(purchasedRtIds);
  }
}
