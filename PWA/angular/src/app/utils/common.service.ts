import { CurrencyPipe, Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { PopupDataItem, PopupService } from '../popup/popup.service';
import { ClevertapService } from './clevertap.service';
import { CustomTranslateService } from './custom-translate.service';
import { GdprService } from './gdpr.service';
import { GTMService } from './gtm.service';
import { HttpRequestService } from './http-request.service';
import { CustomScriptLoaderService, ScriptItem } from './custom-script-loader.service'

declare var $, toggleControls: any, stopAudio: any, updateAllCallerFields: any,
  updateSpecialCallerFields: any, toggleActivityHistorySliderButton: any,
  toggleActivitySelectionSliderButton: any;

@Injectable({
  providedIn: 'root'
})

export class CommonService {

  private isHomeBannerLoaded = new Subject<boolean>();
  private isHomeSliderLoaded = new Subject<boolean>();
  private isInitialLoadingCompleted = new Subject<boolean>();
  private isInitialLoadingCompletedBehaviourSub: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private hideOrShowFooter = new Subject<boolean>();
  private hideContentImage = new Subject<boolean>();
  private headerResolved = new Subject<boolean>();
  private headerChecked = new BehaviorSubject<boolean>(null);
  private headerRedirectReq = new BehaviorSubject<boolean>(null);
  private languagesUpdated = new Subject<boolean>();
  private corouselItems = new BehaviorSubject<any>(null);
  private totalItemsCount = new BehaviorSubject<number>(null);
  private searchTags = new BehaviorSubject<any>(null);
  private searchText = new BehaviorSubject<string>(null);
  private defaultLanguages = new BehaviorSubject<string[]>(null);
  private defaultLanguagesIds = new BehaviorSubject<string[]>(null);
  private selectedProfileItems = new BehaviorSubject<any>(null);

  private purchasedRingBack = new BehaviorSubject<string[]>(null);
  private purchasedRealtone = new BehaviorSubject<string[]>(null);
  private rtCatalogSubscriptionId = new BehaviorSubject<string>(null);
  private rtUserStatus = new BehaviorSubject<string>(null);

  private updateCTWithMyAccount = new Subject<boolean>();
  private updateCTWithRTMyAccount = new Subject<boolean>();
  private bannerItemsContent = new Subject<any>();
  private loadFooter = new Subject<boolean>();
  private initialLoadingAndFooterDisplayStatus = new BehaviorSubject<boolean>(null);

  private customWorker: Worker = null;

  constructor(private router: Router, private translate: CustomTranslateService,
    private popupService: PopupService, private location: Location,
    private httpRequest: HttpRequestService, private translateService: TranslateService,
    private deviceService: DeviceDetectorService, private clevertapService: ClevertapService,
    private gtmService: GTMService, private gdprService: GdprService,
    private currencyPipe: CurrencyPipe, private customScriptLoader: CustomScriptLoaderService) { }

  setIsHeaderResolved(status: boolean) {
    this.headerResolved.next(status);
  }

  getIsHeaderResolved(): Observable<boolean> {
    return this.headerResolved.asObservable();
  }

  setIsHeaderChecked(status: boolean) {
    this.headerChecked.next(status);
  }

  getIsHeaderChecked(): Observable<boolean> {
    return this.headerChecked.asObservable();
  }

  setIsHeaderRedirectReq(status: boolean) {
    this.headerRedirectReq.next(status);
  }

  getIsHeaderRedirectReq(): Observable<boolean> {
    return this.headerRedirectReq.asObservable();
  }

  setIsInitialLoadingCompleted(status: boolean) {
    this.isInitialLoadingCompletedBehaviourSub.next(status);
    this.isInitialLoadingCompleted.next(status);
  }
  getIsInitialLoadingCompleted(): Observable<boolean> {
    return this.isInitialLoadingCompleted.asObservable();
  }
  getLatestValueForInitailLoading(): Observable<boolean> {
    return this.isInitialLoadingCompletedBehaviourSub.asObservable();
  }
  setHomeBannerLoadedStatus(status: boolean) {
    this.isHomeBannerLoaded.next(status);
  }
  getHomeBannerLoadedStatus(): Observable<boolean> {
    return this.isHomeBannerLoaded.asObservable();
  }

  setHomeSliderLoadedStatus(status: boolean) {
    this.isHomeSliderLoaded.next(status);
  }
  getHomeSliderLoadedStatus(): Observable<boolean> {
    return this.isHomeSliderLoaded.asObservable();
  }

  setFooterDisplayStatus(status: boolean) {
    this.hideOrShowFooter.next(status);
  }
  getFooterDisplayStatus(): Observable<boolean> {
    return this.hideOrShowFooter.asObservable();
  }

  setCorouselItems(items: any) {
    this.corouselItems.next(items);
  }

  getCorouselItems(): any {
    return this.corouselItems.getValue();
  }

  setSelectedProfileItems(items: any) {
    this.selectedProfileItems.next(items);
  }

  getSelectedProfileItems(): any {
    return this.selectedProfileItems.getValue();
  }

  setTotalItemsCount(totalItemCount: any) {
    this.totalItemsCount.next(totalItemCount);
  }

  getTotalItemsCount(): any {
    return this.totalItemsCount.getValue();
  }

  setSearchTagsValue(searchTags: any) {
    this.searchTags.next(searchTags);
  }

  getSearchTagsValue(): any {
    return this.searchTags.getValue();
  }

  setHidePopupContentImage(hideContentImg: boolean) {
    this.hideContentImage.next(hideContentImg);
  }

  getHidePopupContentImage(): Observable<any> {
    return this.hideContentImage.asObservable();
  }

  setLanguagesUpdated(updated: boolean) {
    this.languagesUpdated.next(updated);
  }

  getLanguagesUpdated(): Observable<any> {
    return this.languagesUpdated.asObservable();
  }

  setSearchTextValue(searchText: string) {
    this.searchText.next(searchText);
  }

  getSearchTextValue(): Observable<any> {
    return this.searchText.asObservable();
  }

  getDefaultLanguage(): string[] {
    return this.defaultLanguages.getValue();
  }

  setDefaultLanguage(defaultLangs: string[]): void {
    this.defaultLanguages.next(defaultLangs);
  }

  getDefaultLanguageIds(): string[] {
    return this.defaultLanguagesIds.getValue();
  }

  setDefaultLanguageIds(defaultLangsIds: string[]): void {
    this.defaultLanguagesIds.next(defaultLangsIds);
  }


  getPurchasedRingBackIds(): string[] {
    return this.purchasedRingBack.getValue();
  }

  setPurchasedRingBackIds(purchasedRingBack: string[]): void {
    this.purchasedRingBack.next(purchasedRingBack);
  }

  getPurchasedRealtoneIds(): string[] {
    return this.purchasedRealtone.getValue();
  }

  setPurchasedRealtoneIds(purchasedRealtone: string[]): void {
    this.purchasedRealtone.next(purchasedRealtone);
  }

  setCTWithMyAccountStatus(status: boolean) {
    this.updateCTWithMyAccount.next(status);
  }

  getCTWithMyAccountStatus(): Observable<boolean> {
    return this.updateCTWithMyAccount.asObservable();
  }

  setCTWithRTMyAccountStatus(status: boolean) {
    this.updateCTWithRTMyAccount.next(status);
  }

  getCTWithRTMyAccountStatus(): Observable<boolean> {
    return this.updateCTWithRTMyAccount.asObservable();
  }

  getRtCatalogSubscriptionId(): string {
    return this.rtCatalogSubscriptionId.getValue();
  }

  setRtCatalogSubscriptionId(rtCatalogSubscriptionId: string): void {
    this.rtCatalogSubscriptionId.next(rtCatalogSubscriptionId);
  }

  getRtUserStatus(): string {
    return this.rtUserStatus.getValue();
  }

  setRtUserStatus(userStatus: string): void {
    this.rtUserStatus.next(userStatus);
  }

  goToURL(url: string): void {
    if (url.indexOf('http') !== -1 || url.indexOf('https') !== -1) {
      window.location.href = url;
    } else {
      let currentUrl = this.router.url;
      if (currentUrl == url) {
        location.reload();
      } else {
        if (url == "/store") {
          sessionStorage.setItem("FromStore", "true");
        }
        this.redirectToURL(url);
      }
    }
  }

  redirectToURL(url: string): void {
    this.router.navigateByUrl(url);
  }

  getSVGHTMLForJssorBullet(): any {
    let bulletSVGContent = "<svg viewbox=\"0 0 16000 16000\" style=\"position:absolute;top:0;left:0;width:100%;height:100%;\"><circle class=\"b\" cx=\"8000\" cy=\"8000\" r=\"5800\"></circle></svg>";
    return bulletSVGContent;

  }

  getSVGHTMLForJssorArrowRight(): any {
    let arrowRightSVGContent = "<svg viewbox=\"0 0 16000 16000\" style=\"position:absolute;top:-25px;left:0;width:100%;height:100%;\"><polyline class=\"a\" points=\"4960,1920 11040,8000 4960,14080 \"></polyline></svg>";
    return arrowRightSVGContent;
  }

  getSVGHTMLForJssorArrowLeft(): any {
    let arrowLeftSVGContent = "<svg viewbox=\"0 0 16000 16000\" style=\"position:absolute;top:-25px;left:0;width:100%;height:100%;\"><polyline class=\"a\" points=\"11040,1920 4960,8000 11040,14080 \"></polyline></svg>";
    return arrowLeftSVGContent;
  }

  toggleAudioControls(isRTContent: boolean, stopBtnClass: string,
    CT_preview_src: string, item: any, profilePreviewElemId?: string, isPopupPreview?: boolean): void {
    let isPreviewPlaying = false;
    let streamUrl = item.preview_stream_url;
    let previewElementId = streamUrl;
    let playerElementId = document.getElementById(streamUrl);

    if (isPopupPreview != null && isPopupPreview) {
      playerElementId = document.getElementById(streamUrl + '$$popup');
      previewElementId = streamUrl + '$$popup';
    }
    let playerElementId_Profile = document.getElementById(profilePreviewElemId);

    if (!$(playerElementId).hasClass(stopBtnClass) || (profilePreviewElemId != null && !$(playerElementId_Profile).hasClass(stopBtnClass))) {
      isPreviewPlaying = true;
      this.storeContentIdtoLocal(item);
    }

    if (isPreviewPlaying) {
      this.updateCT_PreviewObject(item, CT_preview_src);
    }

    if (isRTContent) {
      previewElementId = item.realtone.made_reference_id;
    }
    else if (null != profilePreviewElemId) {
      previewElementId = profilePreviewElemId;
    }

    if (isRTContent) {
      if (item.realtone) {
        let rtObj = item.realtone;
        let params = [];
        params.push({ paramName: 'madeContentType', paramValue: 'audio' });
        params.push({ paramName: 'madeContext', paramValue: rtObj.made_context });
        params.push({ paramName: 'madeRefId', paramValue: rtObj.made_reference_id });

        this.httpRequest.get('getmadeurl', params)
          .subscribe(resp => {
            if (resp) {
              let madeUrl = resp.result;
              this.toggleAudioControlsFromScript(madeUrl, stopBtnClass, previewElementId);
            }
          });
      }
    } else {
      this.toggleAudioControlsFromScript(streamUrl, stopBtnClass, previewElementId);
    }
  }

  private toggleAudioControlsFromScript(url: any, cssClass: string, elementId: any): void {

    let scriptItem: ScriptItem = { name: "playerScript", src: "scripts/playerScript.min.js" };

    this.customScriptLoader.loadScript(scriptItem).subscribe(
      (res: boolean) => {
        if (res) {
          toggleControls(url, cssClass, elementId);
        }
      });
  }

  stopPlayerIfApplicable(): void {

    let isLoaded: boolean = this.customScriptLoader.checkIfScriptLoaded('playerScript');
    if (isLoaded) {
      stopAudio();
    }

  }

  updateCT_PreviewObject(item: any, source: string) {
    let ctPreviewObj = {};
    ctPreviewObj['source'] = source;
    ctPreviewObj['tune_id'] = item.id;
    ctPreviewObj['tune_name'] = item.track_name;
    ctPreviewObj['tune_type'] = item.type;
    if (item.subtype) {
      ctPreviewObj['tune_subtype'] = item.subtype.type;
    }
    ctPreviewObj['language'] = item.language;
    //category_name
    this.clevertapService.updateClevertapEvent("Preview", false, null, ctPreviewObj);
    let gtmEventObj = JSON.parse(JSON.stringify(ctPreviewObj));
    if (null != gtmEventObj) {
      gtmEventObj['event'] = 'Preview';
      this.gtmService.pushGTMEvent(gtmEventObj, false, 'GTM_Preview');
    }
  }

  goToChartContentPage(items: any, sliderIndex: number, totalItemsCount: number,
    CT_source: string, chartId: string, isRTContent: boolean, reload: boolean) {

    let selectedItem = null;
    let url = "/content/";

    if (isRTContent) {
      url = "/rtcontent/";
    }

    if (null != items) {
      this.setCorouselItems(items);
      selectedItem = items[sliderIndex];
      let urlComponents: string = selectedItem.id + "/" + selectedItem.type + "/";
      url += urlComponents + sliderIndex;
      this.updateCT_SetObject(selectedItem, CT_source, chartId);
    }

    if (null != totalItemsCount) {
      this.setTotalItemsCount(totalItemsCount);
    }

    if (null != chartId) {
      url = url + "/" + chartId;
      url = this.getContentUrlWithMetaData(url, selectedItem);
      this.router.navigateByUrl(url);
    } else if (reload) {
      let currentUrl = this.router.url;
      if (null != items) {
        sessionStorage.setItem("corouselItem", JSON.stringify(items));
      }
      if (null != currentUrl && currentUrl == url) {
        location.reload();
      } else {
        url = url + "/ ";
        sessionStorage.setItem("reload", "true");
        url = this.getContentUrlWithMetaData(url, selectedItem);
        this.router.navigateByUrl(url);
      }
    } else {
      url = url + "/ ";
      url = this.getContentUrlWithMetaData(url, selectedItem);
      this.router.navigateByUrl(url);
    }
  }

  goToContentPage(items: any, sliderIndex: number, totalItemsCount: number,
    CT_source: string, isRTContent: boolean) {

    let selectedItem = null;
    let url: string = "/content/";
    if (isRTContent) {
      url = "/rtcontent/";
    }

    if (null != items) {
      this.setCorouselItems(items);
      selectedItem = items[sliderIndex];
      let urlComponents: string = selectedItem.id + "/" + selectedItem.type + "/";
      url += urlComponents + sliderIndex + "/ ";
      this.updateCT_SetObject(selectedItem, CT_source, null);
    }
    if (null != totalItemsCount) {
      this.setTotalItemsCount(totalItemsCount);
    }

    url = this.getContentUrlWithMetaData(url, selectedItem);
    this.router.navigateByUrl(url);
  }

  private updateStyleSheetValue(cssUrl: string): void {
    var stylesheet = document.getElementById("stylesheet");
    stylesheet.setAttribute('href', cssUrl);
  }

  private getStyleSheetValue(): string {
    var stylesheet = document.getElementById("stylesheet");
    return stylesheet.getAttribute('href');
  }

  checkAndUpdateStyleSheetValue(cssUrl: string): void {

    let currentValue = this.getStyleSheetValue();
    if (null != currentValue) {
      if (currentValue != cssUrl) {
        this.updateStyleSheetValue(cssUrl);
      }
    }
    else {
      this.updateStyleSheetValue(cssUrl);
    }

  }

  goBack() {
    this.location.back();
  }

  private getStoreId(): Observable<any> {
    let params = [];
    return this.httpRequest.get("getstoreid", params);
  }

  getMsisdnAsObservable(): Observable<any> {
    return this.httpRequest.get('getmsisdn');
  }

  getGenericErrorDescription(): Observable<any> {
    return this.translateService.get("pwa.default.error.description");
  }

  getNameTuneName(value: string): string {

    if (null != value) {
      let size: number = this.translate.instant('pwa.ringback.artistoralbum.length.limit');
      if (value.length > size) {
        value = value.slice(0, size) + "...";
      }
    }
    return value;
  }

  public checkAndUpdateStoreId(): Observable<string> {

    return new Observable((observer) => {
      let storeId = sessionStorage.getItem("storeId");
      if (null == storeId) {
        this.getStoreId().subscribe(
          storeRes => {
            if (null != storeRes) {
              sessionStorage.setItem("storeId", storeRes);
              observer.next(storeRes);
              observer.complete();
            }
          });
      }
      else {
        observer.next(storeId);
        observer.complete();
      }
    });
  }


  public initiateLoginOrAction(item: any, pageName: string, isRTContent: boolean, historyIndex: any, isDirectSet: boolean): void {
    this.isUserLoggedIn().subscribe(
      (isLoggedIn: boolean) => {
        let loginSourceCTdata = {}
        if (!isLoggedIn) {
          if (pageName == 'userfeedback') {
            loginSourceCTdata = this.getCT_loginSourceObject("User Feedback click");
          }
          else if (pageName == 'activity' || pageName == 'activity_history' ||
            pageName == 'delete_selection' || pageName == 'delete_download') {
            loginSourceCTdata = this.getCT_loginSourceObject("Activity click");
          } else if (pageName == 'myaccount') {
            loginSourceCTdata = this.getCT_loginSourceObject("MyAccount click");
          }
          else {
            loginSourceCTdata = this.getCT_loginSourceObject("Set click");
          }
          if (this.deviceService.isMobile()) {
            let isHeaderCheckRequired: boolean = this.translate.instant("pwa.header.check.required") == 'true';
            let isHeaderRedirected = sessionStorage.getItem("isHeaderRedirected");
            let isOredoCheckRequired: boolean = this.translate.instant('pwa.ooredo.header.check.required') == 'true';

            if ((isHeaderCheckRequired || isOredoCheckRequired)
              && (isHeaderRedirected == null || isHeaderRedirected != 'true')) {
              //This is required, if user cleares browser cache when user is on site
              let homeUrl = this.translate.instant("pwa.landing.url");
              window.location.href = homeUrl;
            }
            else {
              this.initiateLogin(item, isRTContent, pageName, historyIndex);
            }
          } else {
            this.initiateLogin(item, isRTContent, pageName, historyIndex);
          }
          this.clevertapService.updateClevertapEvent("Login event", true, null, loginSourceCTdata);
          this.pushLoginEventToGTM(loginSourceCTdata);
        } else if (pageName == 'changenumber') {
          loginSourceCTdata = this.getCT_loginSourceObject("Change Number");
          this.initiateLogin(item, isRTContent, 'changenumber', historyIndex);
          this.clevertapService.updateClevertapEvent("Login event", false, null, loginSourceCTdata);
          this.pushLoginEventToGTM(loginSourceCTdata);
        } else {
          this.goToRequestedAction(item, isRTContent, pageName, historyIndex);
        }
        if (isDirectSet) {
          this.updateCT_SetObject(item, pageName);
        }
        if (pageName == null) {
          this.clevertapService.updateClevertapEvent("SET_Click", false, 'SET_CLICK_CT_EVENT_DATA', null);
          let setClickGTMEventObj = JSON.parse(sessionStorage.getItem('SET_CLICK_CT_EVENT_DATA'));
          if (null != setClickGTMEventObj) {
            setClickGTMEventObj['event'] = 'SET_Click';
            this.gtmService.pushGTMEvent(setClickGTMEventObj, false, 'GTM_SET_Click');
          }
        }
      });
  }

  private pushLoginEventToGTM(loginSourceCTdata: any) {
    let loginGTMEventObj = JSON.parse(JSON.stringify(loginSourceCTdata));
    if (null != loginGTMEventObj) {
      loginGTMEventObj['event'] = 'Login event';
      this.gtmService.pushGTMEvent(loginGTMEventObj, true, 'GTM Login event');
    }
  }

  public isPrerenderingEnabled(): boolean {
    let enableUA: boolean = (this.translate.instant('pwa.allow.prerender.browsing.without.login') == 'true');
    let uaConfigStr: string = this.translate.instant('pwa.prerender.useragent.values');
    let uaConfig: string[] = uaConfigStr.split(',');
    let ua: string = this.deviceService.userAgent;
    for (let config of uaConfig) {
      if (enableUA && ua.includes(config)) {
        return true;
      }
    }
    return false;
  }

  public initiateLogin(item: any, isRTContent: boolean, pageName: string, historyIndex: any) {
    let heading = this.translate.instant("pwa.popup.heading.text");
    let enableLoginOnLaunch: boolean = this.translate.instant("pwa.enable.login.on.launch") == 'true';
    let showClose: boolean = true;
    if (enableLoginOnLaunch) {
      showClose = false;
    }

    let popupItem: PopupDataItem = {
      isLoggedIn: false,
      type: "purchase",
      popupData: item,
      heading: "",
      response: null,
      showCloseButton: showClose,
      historyIndex: historyIndex,
      pageName: pageName,
      isSetForNone: false
    };

    if (isRTContent) {
      heading = this.translate.instant('pwa.popup.rt.purchase.heading.text');
      popupItem.type = 'rt_purchase';
    } else if (pageName == 'activity') {
      heading = this.translate.instant('pwa.popup.activity.login.heading.text');
      popupItem.type = "activity";
    } else if (pageName == 'userfeedback') {
      heading = this.translate.instant('pwa.popup.feedback.login.heading.text');
      popupItem.type = "userfeedback";
    } else if (pageName == 'profiles') {
      heading = this.translate.instant('pwa.popup.profiles.heading.text');
      popupItem.type = "profile_purchase";
    } else if (pageName == 'shuffles') {
      heading = this.translate.instant('pwa.popup.shuffles.heading.text');
    } else if (pageName == 'delete_selection') {
      heading = this.translate.instant('pwa.activity.page.delete.selection.popup.heading');
      popupItem.type = pageName;
    } else if (pageName == 'delete_download') {
      heading = this.translate.instant('pwa.activity.page.delete.download.popup.heading');
      popupItem.type = pageName;
    } else if (pageName == 'activity_setfornone') {
      popupItem.isSetForNone = true;
    } else if (pageName == 'changenumber') {
      heading = this.translate.instant('pwa.change.number.popup.heading');
      popupItem.type = pageName;
      popupItem.showCloseButton = true;
      popupItem.isLoggedIn = true;
    } else if (null != pageName) {
      heading = this.translate.instant('pwa.popup.home.login.heading.text');
      popupItem.type = pageName;
    }

    popupItem.heading = heading;
    this.popupService.showPopup(popupItem);
  }

  private goToRequestedAction(item: any, isRTContent: boolean, pageName?: string, historyIndex?: any) {
    if (pageName == 'activity') {
      this.router.navigateByUrl('activity');
    }
    else if (pageName == 'userfeedback') {
      this.router.navigateByUrl('userfeedback');
    }
    else if (pageName == 'myaccount') {
      this.router.navigateByUrl('myaccount');
    }
    else if (null != pageName && (pageName.indexOf("/") > -1)) {
      let destinationUrl = pageName.replace("/", "");
      this.router.navigateByUrl(destinationUrl);
      location.reload();
    }
    else {

      let popupItem: PopupDataItem = {
        isLoggedIn: true,
        type: "purchase",
        popupData: item,
        heading: null,
        response: null,
        showCloseButton: true,
        historyIndex: historyIndex,
        pageName: pageName,
        isSetForNone: false
      };

      if (pageName == 'profiles') {
        popupItem.heading = this.translate.instant('pwa.popup.profiles.heading.text');
        popupItem.type = "profile_purchase";
      } else if (pageName == 'shuffles') {
        popupItem.heading = this.translate.instant('pwa.popup.shuffles.heading.text');
      } else if (pageName == 'delete_selection') {
        popupItem.heading = this.translate.instant('pwa.activity.page.delete.selection.popup.heading');
        popupItem.type = pageName;
      } else if (pageName == 'delete_download') {
        popupItem.heading = this.translate.instant('pwa.activity.page.delete.download.popup.heading');
        popupItem.type = pageName;
      } else if (pageName == 'activity_setfornone') {
        popupItem.isSetForNone = true;
      } else if (isRTContent) {
        popupItem.heading = this.translate.instant('pwa.popup.rt.purchase.heading.text');
        popupItem.type = 'rt_purchase';
      } else {
        popupItem.heading = this.translate.instant("pwa.popup.heading.text");
      }
      this.popupService.showPopup(popupItem);
    }
  }

  public isUserLoggedIn(): Observable<boolean> {

    return new Observable((observer) => {
      if (sessionStorage.getItem("loggedIn") == "true") {
        this.checkIsUserLoggedInFromBackend().subscribe(
          backendRes => {
            if (backendRes) {
              observer.next(backendRes);
              observer.complete();
            } else {
              // If backend session fails
              if (this.deviceService.isMobile()) {
                sessionStorage.removeItem("msisdn_updated");
                this.checkLoginDetailsForMobileUser().subscribe(
                  res => {
                    observer.next(res);
                    observer.complete();
                  });
              }
              else {
                observer.next(false);
                observer.complete();
              }
            }
          });
      } else if (this.deviceService.isMobile()) {
        this.checkLoginDetailsForMobileUser().subscribe(
          res => {
            observer.next(res);
            observer.complete();
          });
      }
      else {
        this.checkIsUserLoggedInFromBackend().subscribe(
          backendRes => {
            observer.next(backendRes);
            observer.complete();
          });
      }
    });
  }

  private checkLoginDetailsForMobileUser(): Observable<boolean> {

    return new Observable((observer) => {

      this.isMsisdnAvailableInLocal().subscribe(
        res => {
          if (res) {
            observer.next(true);
            observer.complete();
          }
          else {
            let tefSpainHEEnabled = this.isTefSpainHEEnabled();
            let isGDPREnabled: boolean = this.gdprService.isGDPRFeatureEnabled();
            if (isGDPREnabled || tefSpainHEEnabled) {
              this.checkIsUserLoggedInFromBackend().subscribe(
                backendRes => {
                  observer.next(backendRes);
                  observer.complete();
                });
            }
            else {
              observer.next(false);
              observer.complete();
            }
          }
        });
    });

  }

  public checkIsUserLoggedInFromBackend(): Observable<boolean> {

    return new Observable((observer) => {
      let params = [];
      this.httpRequest.get('isuserloggedin', params).subscribe(
        res => {
          if (res && res.isLoggedIn) {
            if (res.isHeaderUser && this.deviceService.isMobile()) {
              localStorage.setItem("isHeaderUser", "true");
              if (res.encryptedMsisdn && null != res.encryptedMsisdn) {
                //Applicable for Tef Spain HE
                this.setEncryptedValuesInLocalStorage(res, "true");
                this.checkAndInitializeWorker("myAccountInitial");
                this.checkAndInitializeWorker("userInfo");
              }
            }
            observer.next(true);
            observer.complete();
          }
          else {
            sessionStorage.removeItem("loggedIn");
            observer.next(false);
            observer.complete();
          }
        },
        error => {
          sessionStorage.removeItem("loggedIn");
          observer.next(false);
          observer.complete();
        });
    });
  }

  private isMsisdnAvailableInLocal(): Observable<boolean> {

    return new Observable((observer) => {
      let encryptedMsisdn: string = null;
      if (this.deviceService.isMobile()) {
        encryptedMsisdn = localStorage.getItem("token");
        let tokenKey = localStorage.getItem("tokenKey");
        let encryptedUUID = localStorage.getItem("uuid");
        if (null != encryptedMsisdn && encryptedMsisdn.length > 0) {
          let updated: string = sessionStorage.getItem("msisdn_updated");
          if (null == updated || updated != "true") {
            this.updateMsisdnDetails(encryptedMsisdn, tokenKey, true, encryptedUUID)
              .subscribe(res => {
                if (res) {
                  sessionStorage.removeItem("storeId");
                  sessionStorage.setItem("loggedIn", "true");
                  this.checkAndUpdateStoreId().subscribe(
                    storeRes => {
                      observer.next(true);
                      observer.complete();
                    });
                } else {
                  observer.next(false);
                  observer.complete();
                }
              });
          } else {
            observer.next(true);
            observer.complete();
          }
        }
        else {
          observer.next(false);
          observer.complete();
        }
      }
      else {
        observer.next(false);
        observer.complete();
      }

    });
  }

  public updateMsisdnDetails(encryptedMsisdn: string, tokenKey: string, fromLocalStorage: boolean, encryptedUUID: string): Observable<any> {

    return new Observable((observer) => {
      let params = [];
      encryptedMsisdn = encodeURIComponent(encryptedMsisdn);
      if (null != encryptedUUID && encryptedUUID.length > 0 && this.isUUIDFeatureEnabled()) {
        encryptedUUID = encodeURIComponent(encryptedUUID);
        params.push({ paramName: 'uuid', paramValue: encryptedUUID });
      }
      params.push({ paramName: 'token', paramValue: encryptedMsisdn });
      params.push({ paramName: 'tokenKey', paramValue: tokenKey });
      params.push({ paramName: 'fromLocalStorage', paramValue: fromLocalStorage });

      this.httpRequest.post("updatedetails", null, params).subscribe(
        response => {
          if (null != response) {
            if (response.result == "success") {
              sessionStorage.setItem("msisdn_updated", "true");
              if (null == encryptedUUID) {
                this.setUUIDInLocalStorage(response);
              }
              //storeId must be updated
              this.checkAndUpdateStoreId().subscribe(storeRes => {
                observer.next(true);
                observer.complete();
              });
            } else if (response.result == "authentication_error") {
              localStorage.clear();
              sessionStorage.clear();
              location.reload();
            } else if (response.result == "error") {
              sessionStorage.setItem("blockedDescription", response.description);
              localStorage.removeItem("isHeaderUser");
              localStorage.removeItem("token");
              observer.next(false);
              observer.complete();
            } else if (response.result == "token_generation_failed") {
              localStorage.removeItem("isHeaderUser");
              localStorage.removeItem("token");
              observer.next(false);
              observer.complete();
            }
          }
          else {
            observer.next(false);
            observer.complete();
          }
        });
    });

  }

  public isAzaan(item: any): boolean {
    let result = false;
    if (null != item && (item.subtype.type == "ringback_azan" ||
      item.subtype.type == "ringback_copitic" || item.subtype.type == "ringback_dua")) {
      result = true;
    }
    return result;
  }

  public updateCT_SetObject(item: any, source: string, chartId?: string): void {
    let setClickCTEventObj = {};
    setClickCTEventObj['source'] = source;
    setClickCTEventObj['tune_id'] = item.id;
    setClickCTEventObj['tune_type'] = item.type;
    setClickCTEventObj['tune_name'] = item.track_name;
    setClickCTEventObj['tune_language'] = item.language;
    setClickCTEventObj['tune_subtype'] = item.subtype.type;
    if (chartId) {
      setClickCTEventObj['category_id'] = chartId;
    }
    sessionStorage.setItem('SET_CLICK_CT_EVENT_DATA', JSON.stringify(setClickCTEventObj));
  }

  public getCT_loginSourceObject(login_source: string): any {
    let data = {
      "Login_source": login_source
    }
    return data;
  }

  public getPriceWithSymbol(amount, currency): string {
    let isPriceInteger = this.isInteger(amount);
    let currencyCode = this.getCurrencyForMyAccount(currency);
    let amountHasComma = false;
    if (amount.includes(",")) {
      amountHasComma = true;
      amount = amount.replace(",", ".");
    }
    let price = '';
    if (isPriceInteger) {
      price = this.currencyPipe.transform(amount, currencyCode, 'symbol', '1.0-0');
    } else {
      price = this.currencyPipe.transform(amount, currencyCode, 'symbol', '1.2-2');
    }
    if (amountHasComma) {
      price = price.replace(".", ",");
    }
    return price;
  }

  public isInteger(number): boolean {
    let result = (number - Math.floor(number)) != 0;
    if (result)
      return false;
    else
      return true;
  }

  public getCurrencyForMyAccount(currencyValue: string): string {
    let unicode: string = this.translate.instant('pwa.menu.settings.myaccount.currency.codes');
    let uncodes: string[] = unicode.split(",");
    if (null != uncodes) {
      for (let value of uncodes) {
        let values: string[] = value.split(":");
        if (null != values && values.length == 2) {
          if (values[0] == currencyValue) {
            currencyValue = values[1];
            break;
          }
        }
      }
    }
    return currencyValue;
  }

  public stopBackgroundScroll(): void {
    $(document.documentElement).css('overflow', 'hidden');
  }

  public startBackgroundScroll(): void {
    $(document.documentElement).css('overflow', 'auto ');
  }

  public generateRandomCodeForOredo(codeLength: number): string {
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyz";
    let text = "";
    for (let i = 0; i < codeLength; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  public redirectToContest(contestValue) {
    let redirectUrl: string;
    if (contestValue == "/contestWinnerBoard") {
      redirectUrl = this.translate.instant("pwa.contest.leaderboard.url");
    } else if (contestValue == "/contestPlayWin") {
      redirectUrl = this.translate.instant("pwa.contest.playwin.url");
    }
    let utm_source = this.translate.instant("pwa.contest.utm.source");
    redirectUrl = redirectUrl.replace("%UTM_SOURCE%", utm_source);

    this.getContestEncryptedData().subscribe(res => {
      if (res && res.result) {
        redirectUrl = redirectUrl.replace("%ENCRYPTED_DATA%", res.result);
        window.location.href = redirectUrl;
      }
    });
  }

  public getContestEncryptedData(): Observable<any> {
    let params = [];
    return this.httpRequest.get('getencryptedcontestdata', params);
  }

  public goToHome(closePopup: boolean): void {

    if (closePopup) {
      this.popupService.closePopup();
    }
    this.goToURL("/home");
  }
  
  public setEncryptedMsisdnInLocalStorage(encryptedMsisdn: string, isHeaderUser: string): void {
    sessionStorage.setItem("loggedIn", "true");
    sessionStorage.setItem("msisdn_updated", "true");
    let isGDPRConsentAvailable: boolean = this.gdprService.checkIfGDPRConsentApproved();
    if (isGDPRConsentAvailable && this.deviceService.isMobile()) {
      localStorage.setItem("token", encryptedMsisdn);
      localStorage.setItem("isHeaderUser", isHeaderUser);
    }
  }

  public setEncryptedValuesInLocalStorage(response: any, isHeaderUser: string): void {
    this.setEncryptedMsisdnInLocalStorage(response.encryptedMsisdn, isHeaderUser);
    if (this.deviceService.isMobile()) {
      this.setUUIDInLocalStorage(response);
    }
  }

  public isUUIDFeatureEnabled(): boolean {
    let isUUIDEnabled: boolean = this.translate.instant("pwa.enable.uuid.passing.to.voltron") == 'true';
    return isUUIDEnabled;
  }

  private getEncryptedMsisdn(): Observable<any> {
    return new Observable((observer) => {
      let isLoggedIn: boolean = sessionStorage.getItem("loggedIn") == "true";
      if (isLoggedIn && this.deviceService.isMobile()) {
        this.httpRequest.get('getencryptedmsisdn').subscribe(
          res => {
            observer.next(res);
            observer.complete();
          },
          error => {
            observer.next(null);
            observer.complete();
          });
      } else {
        observer.next(null);
        observer.complete();
      }
    });
  }

  public updateGDPRResposne(response: boolean): void {
    if (response) {
      localStorage.setItem("GDPRConsent", 'true');
      this.getEncryptedMsisdn().subscribe(res => {
        if (null != res && null != res.encryptedMsisdn && this.deviceService.isMobile()) {
          localStorage.setItem("token", res.encryptedMsisdn);
        }
        this.clevertapService.pushNotifications(true);
      });
    } else {
      sessionStorage.setItem("GDPRClosed", 'true');
      localStorage.removeItem("token");
    }
    this.gdprService.setGDPRPermissionVisibility(false);
    this.updateCTPermissionStatusObject();
  }

  storeContentIdtoLocal(item) {
    let contentId = item.id;
    let length: number;
    this.translate.get("pwa.max.content.id.stored").subscribe(res => {
      if (res != null) {
        length = Number(res);
      }
    });
    if (isNaN(length)) {
      length = 3;
    }
    let ContentIds = localStorage.getItem("contentIds");
    if (ContentIds == null) {
      localStorage.setItem('contentIds', contentId);
    } else {
      let ContentIdsArr = ContentIds.split(',');
      //to check if the contentId to be entered is already present or not
      if (ContentIdsArr.includes(contentId)) {
        ContentIdsArr.splice(ContentIdsArr.indexOf(contentId), 1);
        ContentIds = ContentIdsArr.toString();
      }
      //to remove the oldest content ID if lenght goes beyond limit
      if (ContentIdsArr.length >= length) {
        ContentIdsArr.shift();
        ContentIds = ContentIdsArr.toString();
      }
      //null check after the removal of duplicate contentID or removing oldest contentID
      if (ContentIds == null || ContentIds == "") {
        localStorage.setItem('contentIds', contentId);
      } else {
        localStorage.setItem('contentIds', ContentIds + "," + contentId);
      }
    }
  }

  public getContentLanguageIdsSelected(): string {
    let contentLangValuesIds: string = localStorage.getItem("contentLanguageId");
    if (null == contentLangValuesIds || contentLangValuesIds.length == 0) {
      contentLangValuesIds = this.getDefaultLanguageIds().toString();
    }
    return contentLangValuesIds;
  }

  public isTefSpainHEEnabled(): boolean {
    return this.translate.instant('pwa.enable.tefspain.header.check') == 'true';
  }

  public getParentChartUrl(chart: any): string {
    let url = "/more/charts/" + chart.id + "/" + chart.chart_name;
    if (chart.description) {
      url += "/" + chart.description;
    }
    url = this.updateOperatorName(url);
    url = this.removeSpecialCharactersFromUrl(url);
    return url;
  }

  public getChartContentUrl(chart: any): string {
    let url = "/more/chartcontent/" + chart.id + "/" + chart.name;
    if (chart.description) {
      url += "/" + chart.description;
    }
    url = this.updateOperatorName(url);
    url = this.removeSpecialCharactersFromUrl(url);
    return url;
  }

  public getRTChartContentUrl(chart: any): string {
    let url = "/more/rtchartcontent/" + chart.id + "/" + chart.name;
    if (chart.description) {
      url += "/" + chart.description;
    }
    url = this.updateOperatorName(url);
    url = this.removeSpecialCharactersFromUrl(url);

    return url;
  }

  private getContentUrlWithMetaData(url: string, selectedItem: any): string {
    let urlComponents = "";
    if (null != selectedItem) {
      urlComponents = "/" + selectedItem.track_name + "/" + selectedItem.album_name
        + "/" + selectedItem.primary_artist_name
    }
    urlComponents = this.updateOperatorName(urlComponents);
    urlComponents = this.removeSpecialCharactersFromUrl(urlComponents);
    url += urlComponents;
    return url;
  }

  private updateOperatorName(url: string): string {
    let operatorName: string = this.translate.instant("pwa.operator.name");
    url += "/" + operatorName;
    return url;
  }

  private removeSpecialCharactersFromUrl(url: string): string {
    if (null != url) {
      url = url.replace(/\)/g, ""); // this regex /\)/g will replace all occurances of ( with ''
      url = url.replace(/\(/g, ""); // this regex /\(/g will replace all occurances of ) with ''
    }
    return url;
  }

  public getAvailableLanguageDetails(): string[] {
    let langDetails: string[] = null;
    this.translateService.get("pwa.browsing.languages").subscribe(
      resp => {
        let languages: string = resp;
        if (languages != null && languages != "pwa.browsing.languages") {
          langDetails = languages.split(",");
        }
      });
    return langDetails;

  }

  public trackById(index: number, item: any) {
    return item.id;
  }

  updateCTPWALaunchedObject() {
    let loggedIn: boolean = sessionStorage.getItem("loggedIn") == "true";
    let ctPWALaunchedObj = {};
    if (sessionStorage.getItem("First_launch") == "true") {
      ctPWALaunchedObj['First_launch'] = true;
    } else {
      ctPWALaunchedObj['First_launch'] = false;
    }

    let currentUrl = this.location.path();
    currentUrl = currentUrl.split("/")[1];
    ctPWALaunchedObj['Page_viewed'] = currentUrl;

    if (loggedIn) {
      if (sessionStorage.getItem("UserInfo")) {
        let UserDetails = JSON.parse(sessionStorage.getItem("UserInfo"));
        ctPWALaunchedObj['Userid'] = UserDetails.user_id;
        ctPWALaunchedObj['User_type'] = UserDetails.user_status;
      }
      ctPWALaunchedObj['Registration_status'] = "Registered";
      this.clevertapService.updateClevertapEvent("PWA Launched", false, null, ctPWALaunchedObj);
    } else {
      ctPWALaunchedObj['User_type'] = "Unknown";
      ctPWALaunchedObj['Registration_status'] = "Unregistered";
      this.clevertapService.updateClevertapEvent("PWA Launched", false, null, ctPWALaunchedObj);
    }
    sessionStorage.setItem("PWALaunched", "true");
    let gtmEventObj = JSON.parse(JSON.stringify(ctPWALaunchedObj));
    if (null != gtmEventObj) {
      gtmEventObj['event'] = 'PWA Launched';
      this.gtmService.pushGTMEvent(gtmEventObj, false, "GTM_PWA_Launched");
    }
  }

  updateCTPermissionStatusObject() {
    let ctPermissionStatusObj = {};
    let isGDPRConsentApproved: boolean = localStorage.getItem("GDPRConsent") == 'true';
    if (isGDPRConsentApproved) {
      ctPermissionStatusObj['User_Privacy_GDPR_permission_status'] = true;
      this.clevertapService.updateClevertapEvent("Permission Status", false, null, ctPermissionStatusObj);
    }
  }

  pwaLaunchEvent() {
    let params = {}
    let contentLangValuesIds: string = this.getContentLanguageIdsSelected();
    params["language"] = contentLangValuesIds;

    if (localStorage.getItem("userId")) {
      params["user_id"] = localStorage.getItem("userId");
    } else if (sessionStorage.getItem("userId")) {
      params["user_id"] = sessionStorage.getItem("userId");
    }

    if (sessionStorage.getItem("UserDetails") != null) {
      let myAccountDetails = JSON.parse(sessionStorage.getItem("UserDetails"));
      params["subscription_status"] = myAccountDetails.Subscription_status;
      params["subscription_type"] = myAccountDetails.User_bill_type;
      params["operator"] = myAccountDetails.Operator;
      params["circle"] = myAccountDetails.Circle;
    }

    this.checkAndInitializeWorker("postPwaLaunch", params);
    sessionStorage.setItem("PWALaunchforKPI", "true");
  }

  checkIfStoreIdPresentInReqParams(): Observable<boolean> {
    return new Observable((observer) => {
      this.translate.get('pwa.storeid.key')
        .subscribe(resp => {
          let urlParams = new URLSearchParams(window.location.search);
          let storeId = urlParams.get(resp);
          if (storeId && storeId != "") {
            let params = [];
            params.push({ paramName: 'storeId', paramValue: storeId });
            this.httpRequest.get('updatestoreid', params)
              .subscribe(resp => {
                if (resp && resp.result == 'success') {
                  sessionStorage.setItem("storeId", storeId);
                  observer.next(true);
                  observer.complete();
                }
              });
          } else {
            observer.next(false);
            observer.complete();
          }
        });
    });
  }

  isUserLoggedInFromOperatorEnd(): Observable<boolean> {
    let urlParams = new URLSearchParams(window.location.search);
    return new Observable((observer) => {
      if (urlParams) {
        let token: string = urlParams.get(this.translate.instant('pwa.token.key'));
        let ctoken: string = urlParams.get(this.translate.instant('pwa.ctoken.key'));
        let mode: string = urlParams.get(this.translate.instant('pwa.external.mode'));
        let uuid: string = urlParams.get(this.translate.instant('pwa.uuid.key'));

        if (this.isValidParam(token) && this.isValidParam(ctoken) && this.isValidParam(mode)) {
          if (sessionStorage.getItem("loggedIn") == "true") {
            observer.next(true);
            observer.complete();
          } else {
            let param = [];
            param.push({ paramName: 'token', paramValue: token });
            param.push({ paramName: 'ctoken', paramValue: ctoken });
            param.push({ paramName: 'mode', paramValue: mode });
            // UUID is optional
            if(uuid && this.isUUIDFeatureEnabled() && uuid.length > 0){
              param.push({ paramName: 'uuid', paramValue: uuid });
            }

            this.httpRequest.get('getoperatoruserdetails', param)
              .subscribe(resp => {
                if (resp && resp.encryptedMsisdn) {
                  this.setEncryptedValuesInLocalStorage(resp, "true");
                  observer.next(true);
                  observer.complete();
                } else {
                  observer.next(false);
                  observer.complete();
                }
              });
          }
        } else {
          observer.next(false);
          observer.complete();
        }
      }
      else {
        observer.next(false);
        observer.complete();
      }
    });
  }

  isValidParam(param: string): boolean {
    if (param != null && param != "") {
      return true;
    }
    return false;
  }

  clearUTMParamsFromCT(): void {
    let utmParamsMap = {};
    this.translate.get('pwa.utm.params.list')
      .subscribe(resp => {
        let utmParams = resp.split(',');
        for (let i = 0; i < utmParams.length; i++) {
          utmParamsMap[utmParams[i]] = "";
        }
        if (Object.keys(utmParamsMap).length !== 0) {
          this.clevertapService.updateClevertapUserProfile(utmParamsMap, false, null);
        }
      });
  }

  setBannerItemsContent(items: any): void {
    this.bannerItemsContent.next(items);
  }

  getBannerItemsContent(): Observable<any> {
    return this.bannerItemsContent.asObservable();
  }

  setLoadFooterVal(loadFooter: boolean): void {
    this.loadFooter.next(loadFooter);
  }

  getLoadFooterVal(): Observable<boolean> {
    return this.loadFooter.asObservable();
  }

  setInitialLoadingAndFooterDisplayStatus(status: boolean): void {
    this.initialLoadingAndFooterDisplayStatus.next(status);
  }

  getInitialLoadingAndFooterDisplayStatus(): Observable<boolean> {
    return this.initialLoadingAndFooterDisplayStatus.asObservable();
  }

  getCustomWorker(): Worker {
    return this.customWorker;
  }

  checkAndInitializeWorker(typeStr: string, params?: any) {
    if (!this.customWorker) {
      this.customWorker = new Worker('../custom.worker', { type: 'module' });
      this.customWorker.addEventListener('message', message => this.handleWorkerMessage(message), { passive: true });
    }
    if (params) {
      this.customWorker.postMessage({ type: typeStr, params: params });
    } else {
      this.customWorker.postMessage({ type: typeStr });
    }
  }

  private handleWorkerMessage(message: any): void {
    let resultObj = message.data;
    if (resultObj && resultObj.result) {
      if (resultObj.type == "rtHistory") {
        this.setPurchasedRealtoneIds(resultObj.result);
      } else if (resultObj.type == "selection") {
        this.setPurchasedRingBackIds(resultObj.result);
      } else if (resultObj.type == "myAccountRT" || resultObj.type == "myAccountRTInitial") {
        this.setRtCatalogSubscriptionId(resultObj.result.catalog_subscription_id);
        this.setRtUserStatus(resultObj.result.rtUserStatus);
        this.clevertapService.updateClevertapUserProfile(resultObj.result.rtUserProfileObj, false, null);
        sessionStorage.setItem("RTPlanDetails", JSON.stringify(resultObj.result.myRTAccountDetails));
      } else if (resultObj.type == "myAccountInitial" || resultObj.type == "myAccount") {
        sessionStorage.setItem('CURRENT_SUBSCRIPTION_ID', resultObj.result.catalog_subscription_id);
        this.clevertapService.updateClevertapUserProfile(resultObj.result.userProfileObj, false, null);
        sessionStorage.setItem("PlanDetails", JSON.stringify(resultObj.result.myAccountDetails));
        sessionStorage.setItem("UserDetails", JSON.stringify(resultObj.result.userProfileObj));
        if (sessionStorage.getItem("PWALaunchforKPI") != "true") {
          this.pwaLaunchEvent();
        }
        if (resultObj.type == "myAccountInitial") {
          let rtToggleForDesktop = this.translate.instant("pwa.disable.rt.for.desktop").trim() == 'true';
          if ((this.deviceService.isMobile() && this.deviceService.os == 'Android') || (this.deviceService.isTablet() && this.deviceService.os == 'Android')
            || (this.deviceService.isDesktop() && !rtToggleForDesktop && this.deviceService.os != 'Mac')) {
            let isRTEnabledActivity: boolean = this.translate.instant("pwa.activity.page.enable.rt.toggle").trim() == 'true';
            let isRTEnabledMyAccount: boolean = this.translate.instant("pwa.myaccount.enable.rt.toggle").trim() == 'true';
            if (isRTEnabledActivity) {
              let maxSizeRT: number = Number(this.translate.instant('pwa.user.rt.selections.per.page'));
              let params = {
                maxItems: maxSizeRT,
                offset: 0
              }
              this.checkAndInitializeWorker("rtHistory", params);
            }
            if (isRTEnabledMyAccount) {
              this.checkAndInitializeWorker("myAccountRTInitial");
            }
          }
          let myAccountDetails = resultObj.result.myAccountDetails;
          if (myAccountDetails) {
            let status: string = myAccountDetails.Subscription_status;
            if (status && status != "new_user") {
              let maxSizeCT: number = Number(this.translate.instant('pwa.user.selections.per.page'));
              let params = {
                maxItems: maxSizeCT,
                offset: 0
              }
              this.checkAndInitializeWorker("selection", params);
            }
          }
        }
      } else if (resultObj.type == "userInfo") {
        sessionStorage.setItem("UserInfo", JSON.stringify(resultObj.result.userInfoObj));
        if (sessionStorage.getItem("PWALaunched") != "true") {
          this.updateCTPWALaunchedObject();
        }
      } else if (resultObj.type == "bannerContent") {
        this.setBannerItemsContent(resultObj.result);
      } else if (resultObj.type == "clevertapUpdateVoltron") {
        localStorage.setItem('NOTIFICATIONS_API_USER_ID', resultObj.result.userId);
      } else if (resultObj.type == "postPwaLaunch") {
        if (sessionStorage.getItem("loggedIn") == "true") {
          if (this.deviceService.isMobile()) {
            if (!localStorage.getItem('userId')) {
              localStorage.setItem('userId', resultObj.result.userId);
            }
          } else {
            sessionStorage.setItem('userId', resultObj.result.userId);
          }
        } else {
          sessionStorage.setItem('userId', resultObj.result.userId);
        }
      }
    }
  }

  toggleSliderButtonInActivityHistory(itemIndex: any): void {

    let scriptItem: ScriptItem = { name: "sliderScript", src: "scripts/sliderCheckbox.min.js" };

    this.customScriptLoader.loadScript(scriptItem).subscribe(
      (res: boolean) => {
        if (res) {
          toggleActivityHistorySliderButton(itemIndex);
        }
      });

  }

  toggleSliderButtonInActivitySelection(itemIndex: any): void {

    let scriptItem: ScriptItem = { name: "sliderScript", src: "scripts/sliderCheckbox.min.js" };

    this.customScriptLoader.loadScript(scriptItem).subscribe(
      (res: boolean) => {
        if (res) {
          toggleActivitySelectionSliderButton(itemIndex);;
        }
      });

  }

  updateFieldsInAllCaller(): void {
    let scriptItem: ScriptItem = { name: "sliderScript", src: "scripts/sliderCheckbox.min.js" };
    this.customScriptLoader.loadScript(scriptItem).subscribe(
      (res: boolean) => {
        if (res) {
          updateAllCallerFields();
        }
      });
  }

  updateFieldsInSpecialCaller(): void {
    let scriptItem: ScriptItem = { name: "sliderScript", src: "scripts/sliderCheckbox.min.js" };
    this.customScriptLoader.loadScript(scriptItem).subscribe(
      (res: boolean) => {
        if (res) {
          updateSpecialCallerFields();
        }
      });
  }

  setUUIDInLocalStorage(response: any): void {
    if (this.isUUIDFeatureEnabled && response && response.encryptedUUID
      && this.deviceService.isMobile()) {
      localStorage.setItem("uuid", response.encryptedUUID);
    }
  }

}