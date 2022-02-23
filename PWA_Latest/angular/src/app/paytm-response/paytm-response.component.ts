import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentService } from '../content/content.service';
import { PopupDataItem, PopupService } from '../popup/popup.service';
import { PaytmResponseService } from './paytm-response.service';
import { CustomTranslateService } from '../utils/custom-translate.service';

@Component({
    templateUrl: './paytm-response.component.html'
})

export class PaytmResponseComponent implements OnInit {
    contentId: any;
    contentType: any;
    // contentObj: any;
    consentStatusCTObj = {};

    successStatusCode = '0';

    constructor(private paytmRespService: PaytmResponseService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private translate: CustomTranslateService,
        private popupService: PopupService,
        private contentService: ContentService) { }

    ngOnInit(): void {

        this.activatedRoute.queryParams.subscribe(params => {
            this.contentId = params['pwacid'];
            this.contentType = params['pwactype'];
            let uniqueId = params['pwauid'];
            let paymentType = params['paymenttype'];
            let paymentStatus = params['paymentstatus'];

            let currentUrl = this.router.url;
            let queryParam = currentUrl.split('?')[1];
            let extraInfo = encodeURI(queryParam);

            if (paymentStatus == 'cancelled') {
                // redirect user to prebuy page.
                var path = sessionStorage.getItem("userPage");
                this.router.navigate([path]);
            } else if (paymentType == 'wallet' || paymentType == 'operator') {
                this.paytmRespService.getComboRespAfterPayment(uniqueId, this.contentId, extraInfo)
                    .subscribe(resp => {
                        let contentObj = null;
                        if (this.contentId && this.contentType) {
                            this.contentService.getContentMetadata(this.contentId, this.contentType, true)
                                .subscribe(contentResp => {
                                    if (contentResp && contentResp.status != 'failure') {
                                        contentObj = contentResp;
                                        if (resp) {
                                            this.showPaymentResponseMesssage(resp, contentObj);
                                        } else {
                                            this.showPaymentResponseMesssage(resp, contentObj);
                                        }
                                    }
                                }, error => {
                                    this.router.navigateByUrl('/error');
                                });
                        }
                    }, error => {
                        this.showPaymentResponseMesssage(error, null);
                    });
            }
        });
    }

    private showPaymentResponseMesssage(response, contentObj: any): void {
        let popupItem: PopupDataItem = {
            isLoggedIn: true,
            type: "paytm_resp",
            popupData: contentObj,
            heading: null,
            response: "",
            showCloseButton: true,
            historyIndex: "",
            pageName: "",
            isSetForNone: false
        };

        let offlineRUrlStatusCode = this.translate.instant('pwa.offline.rurl.success.response.status_code');
        let offlineRUrlMessage = this.translate.instant('pwa.offline.rurl.success.response.message');

        if (response.playrule && response.playrule.id) {
            popupItem.response = 'paytm_success';
            this.consentStatusCTObj['status'] = 'success';
            this.popupService.showPopup(popupItem);
        } else if (response.status_code && response.status_code == offlineRUrlStatusCode
            && response.message == offlineRUrlMessage) {
            popupItem.response = 'paytm_offline_purchase';
            this.consentStatusCTObj['status'] = 'success';
            this.popupService.showPopup(popupItem);
        } else if (response.thirdpartyconsent) {
            let consentPageUrl = response.thirdpartyconsent.third_party_url;
            let consentReturnUrl = this.translate.instant('pwa.consent.return.url');
            if (consentReturnUrl.indexOf("?") != -1 && consentReturnUrl.split("?").length > 1
              && consentReturnUrl.split("?")[1] != "") {
              consentReturnUrl += "&"
            } else {
              consentReturnUrl += "?";
            }
            consentReturnUrl += "contentId=" + this.contentId + "%26contentType=" + this.contentType;
            consentPageUrl = consentPageUrl.replace("$[CG_RETURN_URL]", consentReturnUrl);
            sessionStorage.setItem("currentPage", this.router.url);
            sessionStorage.setItem("rUrl", response.thirdpartyconsent.return_url);
            sessionStorage.setItem("contentId", this.contentId);
            sessionStorage.setItem("contentType", this.contentType);
            
            window.location.href = consentPageUrl;
          } else {
            popupItem.response = 'paytm_failure';
            this.consentStatusCTObj['status'] = 'failure';
            this.popupService.showPopup(popupItem);
        }
        let path = sessionStorage.getItem("userPage");
        this.router.navigate([path]);
    }
}