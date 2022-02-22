import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentService } from '../content/content.service';
import { PopupDataItem, PopupService } from '../popup/popup.service';
import { ClevertapService } from '../utils/clevertap.service';
import { CommonService } from '../utils/common.service';
import { CustomTranslateService } from '../utils/custom-translate.service';
import { GTMService } from './../utils/gtm.service';
import { ConsentService } from './consent.service';

@Component({
  template: ''
})

export class ConsentComponent implements OnInit {
  contentId: any;
  contentType: any;
  contentObj: any;
  consentStatusCTObj = {};
  gtmEventObj = {};

  successStatusCode = '0';

  constructor(private consentService: ConsentService, private activatedRoute: ActivatedRoute,
    private router: Router, private translate: CustomTranslateService, private popupService: PopupService,
    private contentService: ContentService, private clevertapService: ClevertapService,
    private commonService: CommonService, private gtmService: GTMService) { }

  ngOnInit(): void {
    this.translate.get('pwa.rurl.success.response.status_code')
      .subscribe(resp => {
        this.successStatusCode = resp;
      });

    this.activatedRoute.queryParams.subscribe(params => {
      this.contentId = params['contentId'];
      this.contentType = params['contentType'];

      if (!this.contentId) {
        this.contentId = sessionStorage.getItem("contentId");
      }
      if (!this.contentType) {
        this.contentType = sessionStorage.getItem("contentType");
      }
      let currentUrl = this.router.url;
      let queryParams = currentUrl.split('?')[1];

      this.consentService.getConsentResponse(queryParams)
        .subscribe(response => {
          if (response) {
            if (this.contentId && this.contentType) {
              this.contentService.getContentMetadata(this.contentId, this.contentType, false)
                .subscribe(contentResp => {
                  this.contentObj = null;
                  if (contentResp && contentResp.status != 'failure') {
                    this.contentObj = contentResp;
                  }
                  this.showConsentResponseMesssage(response);
                });
            }
            else {
              this.showConsentResponseMesssage(response);
            }

          }
        }, error => {
          // console.log('something went wrong while getting consent voltron rurl hit: ' + error);
        });
    });
  }

  private showConsentResponseMesssage(response): void {
    let popupItem: PopupDataItem = {
      isLoggedIn: true,
      type: "consent",
      popupData: this.contentObj,
      heading: null,
      response: "",
      showCloseButton: true,
      historyIndex: "",
      pageName: "",
      isSetForNone: false
    };

    if (response.status_code && response.status_code == this.successStatusCode) {
      popupItem.response = 'consent_success';
      this.consentStatusCTObj['status'] = 'success';
      this.gtmEventObj['status'] = 'success';
      this.commonService.setCTWithMyAccountStatus(true);
      this.popupService.showPopup(popupItem);
    } else {
      popupItem.response = 'consent_failure';
      this.consentStatusCTObj['status'] = 'failure';
      this.gtmEventObj['status'] = 'failure';
      this.popupService.showPopup(popupItem);
    }
    this.clevertapService.updateClevertapEvent("Consent_status", false, null, this.consentStatusCTObj);
    this.gtmEventObj['event'] = 'Consent_status';
    this.gtmService.pushGTMEvent(this.gtmEventObj, false, 'GTM_Consent_status');
    var path = sessionStorage.getItem("currentPage");
    this.router.navigate([path]);
  }

}