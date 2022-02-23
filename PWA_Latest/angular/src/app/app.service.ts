import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Observable } from 'rxjs';
import { ClevertapService } from './utils/clevertap.service';
import { CommonService } from './utils/common.service';
import { CustomTranslateService } from './utils/custom-translate.service';
import { GTMService } from './utils/gtm.service';
import { CustomScriptLoaderService, ScriptItem } from './utils/custom-script-loader.service';
import { CustomStatusService } from './utils/custom-status.service';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(private translate: CustomTranslateService, private commonService: CommonService,
    private router: Router, private clevertapService: ClevertapService, private gtmService: GTMService,
    public deviceService: DeviceDetectorService, private commonStatusService: CustomStatusService,
    private customScriptLoader: CustomScriptLoaderService) { }

  isBannerEnabled(url: string, showHomeBanner: boolean): Observable<boolean> {
    return new Observable((observer) => {
      let showBanner = false;
      if (url.startsWith('/home') || url == '/') {
          showBanner = showHomeBanner;
          this.updateBannerAndTrendingDetails(showBanner);
          observer.next(showBanner);
          observer.complete();
      } else if (url.startsWith('/page') || url.startsWith('/userfeedback')
        || url.startsWith('/content') || url.startsWith('/search')
        || url.startsWith('/more/trending') || url == '/activity'
        || url == '/myaccount' || url.startsWith('/rtcontent')
        || url.startsWith('/more/multirecommendations')) {
        showBanner = false;
        this.commonService.setIsInitialLoadingCompleted(true);
        observer.next(showBanner);
        observer.complete();
      } else if (url == '/store') {
        showBanner = this.translate.instant("pwa.store.enable.banner.section").trim() == 'true';
        if (!showBanner) {
          this.commonService.setIsInitialLoadingCompleted(true);
        }
        observer.next(showBanner);
        observer.complete();
      } else if (url == '/rtstore') {
        showBanner = this.translate.instant("pwa.rtstore.enable.banner.section").trim() == 'true';
        if (!showBanner) {
          this.commonService.setIsInitialLoadingCompleted(true);
        }
        observer.next(showBanner);
        observer.complete();

      } else if (url.startsWith('/more')) {
        showBanner = this.translate.instant("pwa.more.enable.banner.section").trim() == 'true';
        observer.next(showBanner);
        observer.complete();
      }

    });
  }

  private updateBannerAndTrendingDetails(showBanner: boolean): void {

    let isLoggedIn: boolean = sessionStorage.getItem("loggedIn") == "true";
    this.commonService.setIsInitialLoadingCompleted(false);
    let showTrending = this.translate.instant("pwa.home.enable.trending.section").trim() == 'true';
    let showRecommend = this.translate.instant("pwa.home.enable.recommend.section").trim() == 'true';
    let enableLoginOnLaunch: boolean = this.translate.instant("pwa.enable.login.on.launch") == 'true';

    if ((!showTrending && !showRecommend) || (enableLoginOnLaunch && !isLoggedIn && !this.commonService.isPrerenderingEnabled())) {
      this.commonService.setHomeSliderLoadedStatus(true);
    }
    if (!showBanner) {
      this.commonService.setHomeBannerLoadedStatus(true);
    }
  }

  goToLandingUrl(landingUrl: string, currentUrl: string): void {

    let loginDestinationUrl = sessionStorage.getItem("loginDestinationUrl");
    if (null != loginDestinationUrl) {
      //For deeplinks
      sessionStorage.removeItem("loginDestinationUrl");
      if (null != loginDestinationUrl) {
        if (loginDestinationUrl != "home") {
          this.router.navigateByUrl(loginDestinationUrl);
        }
      }
    } else {
      if (null != landingUrl) {
        if (currentUrl.indexOf("header") != -1) {
          this.router.navigateByUrl(landingUrl);
        } else if (landingUrl != "home") {
          this.router.navigateByUrl(landingUrl);
        }
      }
    }
  }

  getBrowsingLanguageDetails(langParam: string, browsingLanguage: string): Observable<string> {
    return new Observable((observer) => {
      if (langParam && langParam != "" && browsingLanguage != langParam) {
        if (sessionStorage.getItem("First_launch") != "true") {
          sessionStorage.setItem("First_launch", "true");
        }
        observer.next(langParam);
        observer.complete();
      }
      else {
        if (null == browsingLanguage) {
          //If browisng language is not available in local storage then we set 'EN' as default language 
          sessionStorage.setItem("First_launch", "true");
          observer.next("en");
          observer.complete();
        } else {
          observer.next(browsingLanguage);
          observer.complete();
        }
      }
    });

  }

  updateContentLanguages(contentLanguage: string): void {
    let defaultContentLanguageIds: string[] = [];
    let defaultContentLanguageValues: string[] = [];
    if (null != contentLanguage) {
      let defaultValues: string[] = contentLanguage.split(",");
      if (null != defaultValues) {
        for (let value of defaultValues) {
          let values: string[] = value.split(":");
          if (null != values && values.length == 2) {
            defaultContentLanguageIds.push(values[0]);
            defaultContentLanguageValues.push(values[1]);
          }
        }
        this.commonService.setDefaultLanguage(defaultContentLanguageValues);
        this.commonService.setDefaultLanguageIds(defaultContentLanguageIds)
        this.commonService.setLanguagesUpdated(true);
      }
    }
  }

  updateUTMAndModeParams(params: any): void {
    this.translate.get('pwa.utm.params.list')
      .subscribe(resp => {
        if (resp != null && resp != "pwa.utm.params.list") {
          let utmParamsKey = resp.split(',');
          if (this.deviceService.isDesktop()) {
            let utm_params = sessionStorage.getItem('UTM_PARAMS');
            if (null == utm_params || 'null' == utm_params) {
              this.updateUTMParamsFromURL(params, utmParamsKey);
            } else {
              let diff: boolean = this.compareUTMParamValues(params, utm_params, utmParamsKey);
              if (diff) {
                this.updateUTMParamsFromURL(params, utmParamsKey);
              }
              sessionStorage.setItem("UtmParamsUpdated", "true");
            }
          }
          else {
            let utm_params = localStorage.getItem('UTM_PARAMS');
            if (null == utm_params || 'null' == utm_params) {
              this.updateUTMParamsFromURL(params, utmParamsKey);
            }
            else {
              let diff: boolean = this.compareUTMParamValues(params, utm_params, utmParamsKey);
              if (diff) {
                this.updateUTMParamsFromURL(params, utmParamsKey);
              }
              sessionStorage.setItem("UtmParamsUpdated", "true");
            }
          }
          if (sessionStorage.getItem("enableLoginOnLaunch") == "true") {
            sessionStorage.removeItem("enableLoginOnLaunch");
            let homeUrl = this.translate.instant("pwa.landing.url");
            window.location.href = homeUrl;
          }
        }
      });

    this.translate.get('pwa.external.mode')
      .subscribe(resp => {
        let extMode = params[resp];
        if (extMode !== undefined) {
          sessionStorage.setItem('EXTERNAL_MODE', extMode);
        }
      });
  }

  updateUTMParamsFromURL(params: any, utmParamsKey: any): void {
    let utmParamsMap = {};
    for (let i = 0; i < utmParamsKey.length; i++) {
      if (params[utmParamsKey[i]]) {
        utmParamsMap[utmParamsKey[i]] = params[utmParamsKey[i]];
      }
    }

    //this logic is for clearing utm param values which is not present in URL 
    if (sessionStorage.getItem("mismatchValue") != null) {
      let mismatchValue = sessionStorage.getItem("mismatchValue").split(',');
      for (let i = 0; i < mismatchValue.length - 1; i++) {
        if (!params[mismatchValue[i]]) {
          utmParamsMap[mismatchValue[i]] = "";
        }
      }
      sessionStorage.removeItem("mismatchValue");
    }

    if (Object.keys(utmParamsMap).length !== 0) {
      if (this.deviceService.isDesktop()) {
        sessionStorage.setItem('UTM_PARAMS', JSON.stringify(utmParamsMap));
      } else {
        localStorage.setItem('UTM_PARAMS', JSON.stringify(utmParamsMap));
      }
      this.clevertapService.updateClevertapUserProfile(utmParamsMap, false, null);
      sessionStorage.setItem("UtmParamsUpdated", "true");
    } else {
      if (sessionStorage.getItem("UtmParamsUpdated") != "true") {
        this.commonService.clearUTMParamsFromCT();
      }
    }
  }

  compareUTMParamValues(params: any, utm_params: string, utmParamsKey: any): boolean {
    let utmParamsStored = JSON.parse(utm_params);
    let valueMismatch: boolean = false;
    for (let i = 0; i < utmParamsKey.length; i++) {
      if (params[utmParamsKey[i]] != utmParamsStored[utmParamsKey[i]]) {
        valueMismatch = true;
        sessionStorage.setItem("mismatchValue", utmParamsKey[i] + ",");
      }
    }
    return valueMismatch;
  }


  redirectforOoredoOmanHE() {
    let url = this.translate.instant('pwa.ooredo.header.check.url');
    let redirectURL = this.translate.instant('pwa.ooredo.redirect.url');
    let correlatorId = this.commonService.generateRandomCodeForOredo(16);
    url = url.replace('<CORRELATOR_ID>', correlatorId);
    url = url.replace('<REDIRECT_URL>', redirectURL);
    window.location.href = url;
  }

  isHideBrowsingLanguage(routeUrl: string): Observable<boolean> {
    return new Observable((observer) => {
      this.translate.get("pwa.hide.browsing.language.for.path").subscribe(res => {
        let configuredUrl: string = res;
        if (null != configuredUrl) {
          let arr: string[] = configuredUrl.split(',');
          for (let url of arr) {
            if (routeUrl.startsWith(url)) {
              observer.next(true);
              observer.complete();
            }
          }
        }
        observer.next(false);
        observer.complete();
      });
    });
  }

  updateUserProfileWithDeviceAndLang(browsingLanguage: string, userProfileForClevertap: any): any {
    userProfileForClevertap["app_language"] = browsingLanguage;
    userProfileForClevertap["OS"] = this.deviceService.os;
    let device: string = '';
    if (this.deviceService.isDesktop()) {
      device = "Desktop";
    } else if (this.deviceService.isMobile()) {
      device = "Mobile";
    } else if (this.deviceService.isTablet()) {
      device = "Tablet";
    }
    userProfileForClevertap["device_type"] = device;
    return userProfileForClevertap;
  }

  updateUserProfileWithContentLang(userProfileForClevertap: any): any {
    let contentLangValues: string = localStorage.getItem("contentLanguage");
    if (null == contentLangValues || contentLangValues.length == 0) {
      contentLangValues = this.commonService.getDefaultLanguage().toString();
    }
    userProfileForClevertap["Content_language"] = contentLangValues;
    return userProfileForClevertap;
  }

  updateAppInstalledCL(): void {
    let data = {
      "Install": "Yes"
    };
    this.clevertapService.updateClevertapEvent("UTM_Visited", true, null, data);
    let gtmEventObj = {};
    gtmEventObj['event'] = 'UTM_Visited';
    gtmEventObj['Install'] = 'Yes';
    this.gtmService.pushGTMEvent(gtmEventObj, true, 'GTM_UTM_Visited');
  }

  updateLoginEventCL(): void {
    let loginSourceCTdata = this.commonService.getCT_loginSourceObject("Home login click");
    this.clevertapService.updateClevertapEvent("Login event", true, null, loginSourceCTdata);
    let gtmEventObj = {};
    gtmEventObj['event'] = 'Login event';
    gtmEventObj['Login_source'] = 'Home login click';
    this.gtmService.pushGTMEvent(gtmEventObj, true, 'GTM Login event');
  }

  updateAlreadyRegisteredEventCL(type: string, status: string): void {
    let data = {
      "Updated App MSISDN Status": status,
      "type": type
    };
    this.clevertapService.updateClevertapEvent("Already_registered", true, null, data);
    let gtmEventObj = {};
    gtmEventObj['event'] = 'Already_registered';
    gtmEventObj['Updated App MSISDN Status'] = status;
    gtmEventObj['type'] = type;
    this.gtmService.pushGTMEvent(gtmEventObj, true, 'GTM_Already_registered');
  }

  updateAutoLoginEventCL(sessionCheckRequired: boolean): void {
    this.clevertapService.updateClevertapEvent("Auto_login", sessionCheckRequired, null, null);
    let gtmEventObj = JSON.parse(sessionStorage.getItem('Auto_Login_data'));
    if (null != gtmEventObj) {
      gtmEventObj['event'] = 'Auto_login';
      this.gtmService.pushGTMEvent(gtmEventObj, sessionCheckRequired, 'GTM_Auto_login');
    }
  }

  updateNotificationUserCL(): void {
    let notificationsUserId = localStorage.getItem('NOTIFICATIONS_API_USER_ID');
    if (null == notificationsUserId || "null" == notificationsUserId) {
      if (this.clevertapService.getIsCTInitialized()) {
        this.clevertapService.updateCTUserDetailsToVoltron();
      }
      else {
        this.clevertapService.setIsCTUserUpdateRequired(true);
      }
    }
  }

  updateUserProfileCL(loggedIn: boolean, userProfileForClevertap: any): void {
    let storeId = sessionStorage.getItem("storeId");
    userProfileForClevertap["User_store_id"] = storeId;
    if (loggedIn) {
      userProfileForClevertap["Last_login"] = true;
      let currentDate: Date = new Date();
      userProfileForClevertap["Last_login_date"] = currentDate.toString();
    }
    else {
      userProfileForClevertap["Last_login"] = false;
      userProfileForClevertap["Last_login_date"] = null;
    }
    this.clevertapService.updateClevertapUserProfile(userProfileForClevertap, true, "userProfile");

  }

  updateOnOrientationChange() {
    switch (window.orientation) {
      case -90:
        document.getElementById("landscape").style.display = "block";
        break;
      case 90:
        document.getElementById("landscape").style.display = "block";
        break;
      default:
        document.getElementById("landscape").style.display = "none";
        break;
    }
  }

  loadClevertapAndGTMScript() {

    this.commonStatusService.checkOnline().subscribe(
      onlineRes => {
        if (onlineRes) {
          this.translate.get("pwa.clevertap.account.id").subscribe(
            accountId => {
              let scriptItem: ScriptItem = { name: "clevertap", src: "scripts/clevertapOM.min.js" };
              this.customScriptLoader.loadScript(scriptItem).subscribe(
                (res: boolean) => {
                  if (res) {
                    this.clevertapService.initializeClevertap(accountId);
                    this.clevertapService.pushNotifications(false);
                  }
                });

            });

          this.translate.get('pwa.gtm.enabled').subscribe(response => {
            if (response && response == 'true') {
              let gtmAccId = this.translate.instant('pwa.gtm.account.id');
              let scriptItemGTM: ScriptItem = { name: "gtm", src: "scripts/gtm.min.js" };

              this.customScriptLoader.loadScript(scriptItemGTM).subscribe(
                (res: boolean) => {
                  if (res) {
                    this.gtmService.initializeGTM(gtmAccId);
                  }
                });
            }
          });
        }
      });



  }
}
