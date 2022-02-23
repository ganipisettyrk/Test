import { Component, ComponentFactoryResolver, ComponentRef, HostListener, ViewChild, ViewContainerRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Event as NavigationEvent, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { AppService } from './app.service';
import { PopupComponent } from './popup/popup.component';
import { ToasterMessageService } from './toaster-message/toaster-message.service';
import { AuthenticationService } from './utils/authentication.service';
import { ClevertapService } from './utils/clevertap.service';
import { CommonService } from './utils/common.service';
import { CustomStatusService } from './utils/custom-status.service';
import { CustomTranslateService } from './utils/custom-translate.service';
import { SeoService } from './utils/seo.service';
import { FooterComponent } from './footer/footer.component';
import { GTMService } from './utils/gtm.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title: string = 'PWATitle';
  poweredByText: string;
  yourFavSongText: string;
  isbannerLoaded: boolean = false;
  isSliderLoaded: boolean = false;
  //This has to be set to null
  hideLoading: boolean = null;
  showBanner: boolean = false;
  bannerGroup: string;
  bannerDefaultImageSize: number = 2;
  hideBrowsingLanguage: boolean = false;
  userProfileForClevertap = {};

  showloginPopup: boolean = false;
  browsingLanguage: string = "";
  enableLoginOnLaunch: boolean = false;
  currentUrl: string = "";
  isRTContent: boolean = false;

  navigationUrl: string;
  isLanguagesUpdated: boolean;
  isPopupInitiated: boolean = false;
  isBannerEnabled: boolean = false;
  isFooterLoaded: boolean = false;
  canLoadFooter: boolean = false;

  popupComponentRef: ComponentRef<PopupComponent>;
  footerComponentRef: ComponentRef<FooterComponent>;
  @ViewChild('vcrPopup', { read: ViewContainerRef }) vcrPopup: ViewContainerRef;
  @ViewChild('vcrFooter', { read: ViewContainerRef }) vcrFooter: ViewContainerRef;

  constructor(private translateService: TranslateService, public deviceService: DeviceDetectorService,
    private translate: CustomTranslateService, public titleService: Title, private commonService: CommonService,
    private router: Router, private clevertapService: ClevertapService, private activatedRoute: ActivatedRoute,
    private appService: AppService, private authenticationService: AuthenticationService,
    private toasterMessageService: ToasterMessageService, private customStatusService: CustomStatusService,
    private seoService: SeoService, private componentFactoryResolver: ComponentFactoryResolver,
    private gtmService: GTMService) {
  }

  ngOnInit(): void {

    //Listen to orientation change
    if (this.deviceService.isMobile()) {
      window.addEventListener('orientationchange', this.appService.updateOnOrientationChange, { passive: true });
      this.appService.updateOnOrientationChange();
    }

    //For Webotp
    if ('OTPCredential' in window) {
      window.addEventListener('DOMContentLoaded', e => {
        (<any>window).iswebotpallowed = true;
      });
    }

    this.clevertapService.getIsCTInitializedSubscribe().subscribe(
      res => {
        this.clevertapService.updateCTEvents();
        this.clevertapService.updateCTUserProfiles();
        this.clevertapService.updateCTUserDetails();
      });

    this.gtmService.getIsGTMInitializedSubscribe().subscribe(
      res => {
        this.gtmService.updateGTMEvents();
      });

    this.currentUrl = window.location.href;
    //This should be removed as we need to get original user status to show unsubscribe
    sessionStorage.removeItem('UNSUBSCRIBE_REQUESTED');

    this.activatedRoute.queryParams
      .subscribe(params => {
        if (Object.keys(params).length !== 0) {
          this.appService.updateUTMAndModeParams(params);
        }
      });

    let params = new URLSearchParams(window.location.search);
    let langParam: string = params.get('browsingLanguage');
    let browsingLang = localStorage.getItem("browsingLanguage");

    this.appService.getBrowsingLanguageDetails(langParam, browsingLang).subscribe(
      res => {
        this.translateService.setDefaultLang(res);
        if (langParam && langParam != "" && browsingLang != langParam) {
          this.translateService.get('pwa.browsing.languages')
            .subscribe(resp => {
              let languages: string = resp;
              if (languages != null && languages != "pwa.browsing.languages") {
                let langDetails: string[] = languages.split(",");
                let langCodesArr: string[] = [];
                for (let i = 0; i < langDetails.length; i++) {
                  let langCodes: string[] = langDetails[i].split(":");
                  langCodesArr.push(langCodes[0]);
                }
                if (langCodesArr.includes(langParam)) {
                  res = langParam;
                  localStorage.setItem("browsingLanguage", res);
                } else {
                  let homeUrl = this.translate.instant("pwa.landing.url");
                  window.location.href = homeUrl;
                }
              } else {
                let homeUrl = this.translate.instant("pwa.landing.url");
                window.location.href = homeUrl;
              }
              // this.browsingLanguage = res;
              this.updateBrowsingLanguages();
            });
        }
        this.browsingLanguage = res;
        this.userProfileForClevertap = this.appService.updateUserProfileWithDeviceAndLang(res, this.userProfileForClevertap);

        this.translateService.get('pwa.store.identification.required').subscribe(
          (response: string) => {
            let isStoreIdentificationRequired = (response.trim() == 'true');
            if (isStoreIdentificationRequired) {
              sessionStorage.setItem("isStoreIdentificationRequired", "true");
            }
            if (localStorage.getItem("browsingLanguage") == null) {
              this.updateBrowsingLanguages();
            }

            // This was added for encryption logic
            let msisdn = localStorage.getItem("MSISDN");
            if (null != msisdn) {
              localStorage.removeItem("MSISDN");
              localStorage.removeItem("isHeaderUser");
            }

            this.commonService.checkIfStoreIdPresentInReqParams()
              .subscribe(resp => {
                this.translate.get("pwa.enable.login.on.launch").subscribe(res => {
                  this.enableLoginOnLaunch = res == 'true';
                  if (this.deviceService.isMobile()) {
                    this.updateDetailsForMobile();
                  }
                  else {
                    this.updateDetailsForDesktop();
                  }
                });
              });
          });

      });

    this.commonService.getIsHeaderRedirectReq().
      subscribe(res => {
        if (res) {
          this.commonService.checkIfStoreIdPresentInReqParams()
            .subscribe(resp => {
              this.translate.get("pwa.enable.login.on.launch").subscribe(res => {
                this.enableLoginOnLaunch = res == 'true';
                this.updateDetailsForMobile();
              });
            });
        }
      });

    this.customStatusService.checkOnline().subscribe(
      onlineRes => {
        if (!onlineRes) {
          this.translate.get("pwa.warning.message.user.not.online").subscribe(
            res => {
              this.toasterMessageService.toggleToasterMessageDisplay(true, "warning", res);
            });
        } else {
          this.toasterMessageService.toggleToasterMessageDisplay(false, null, null);
        }
      });

    this.commonService.getIsHeaderResolved()
      .subscribe(headerRes => {
        this.translateService.get("pwa.enable.login.on.launch").subscribe(res => {
          this.enableLoginOnLaunch = res == 'true';
          if (headerRes) {
            let wasContestLoggedInUser: boolean = sessionStorage.getItem("contestUser") == "true";
            if (wasContestLoggedInUser) {
              this.appService.updateAlreadyRegisteredEventCL("contest", "Retrieved");
              this.appService.updateLoginEventCL();
            }
            this.getUpdatedDetails(true);

          } else {
            if (this.enableLoginOnLaunch) {
              this.getDetailsOrRedirect();
            }
            else {
              this.getUpdatedDetails(false);
            }
          }
        });
      });

    this.authenticationService.getLoggedInResult().subscribe(
      res => {
        if (res) {
          this.commonService.checkAndInitializeWorker("myAccountInitial");
          this.commonService.checkAndInitializeWorker("userInfo");
        }
      });

    this.commonService.getHomeBannerLoadedStatus().subscribe(
      res => {
        this.isbannerLoaded = res;
        if (this.isbannerLoaded && this.isSliderLoaded) {
          this.setInitialLoadingStatus();
          this.commonService.setFooterDisplayStatus(true);
          if (this.canLoadFooter){
            this.loadFooter();
          }
        }
      });

    this.commonService.getHomeSliderLoadedStatus().subscribe(
      res => {
        this.isSliderLoaded = res;
        if (this.isbannerLoaded && this.isSliderLoaded) {
          this.setInitialLoadingStatus();
          this.commonService.setFooterDisplayStatus(true);
          if (this.canLoadFooter){
            this.loadFooter();
          }
        }
      });

    this.commonService.getCTWithMyAccountStatus().subscribe(res => {
      if (res) {
        this.commonService.checkAndInitializeWorker("myAccount");
      }
    });

    this.commonService.getCTWithRTMyAccountStatus().subscribe(res => {
      if (res) {
        this.commonService.checkAndInitializeWorker("myAccountRT");
      }
    });

    this.router.events.forEach((event: NavigationEvent) => {
      if (event instanceof NavigationStart) {
        this.navigationUrl = event.url;
        if (!this.navigationUrl.startsWith('/home') && this.navigationUrl != '/') {
          this.loadPopUp(false);
        }
        this.hideBrowsingLanguage = false;
        this.appService.isHideBrowsingLanguage(this.navigationUrl).subscribe(res => {
          this.hideBrowsingLanguage = res;
        });

        this.translate.get("pwa.home.enable.banner.section").subscribe(
          res => {
            let showHomeBanner = (res.trim() == 'true');
            this.appService.isBannerEnabled(this.navigationUrl, showHomeBanner).subscribe(
              res => {
                this.isBannerEnabled = res;
                let isLoggedIn: boolean = sessionStorage.getItem("loggedIn") == "true";
                if (this.enableLoginOnLaunch && !isLoggedIn && this.deviceService.isMobile() 
                && !this.commonService.skipLoginForSelectedPages(this.navigationUrl)) {
                  this.showBanner = false;
                } else {
                  this.showBanner = res;
                }
                this.getBannerGroup(this.navigationUrl);
              });
          });
        if (this.navigationUrl.startsWith('/home') || this.navigationUrl == '/') {
          this.hideLoading = false;
        }
        else {
          this.setInitialLoadingStatus();
        }

        if (!(this.navigationUrl.startsWith('/store') || this.navigationUrl.startsWith('/rtstore')
          || this.navigationUrl.startsWith('/content') || this.navigationUrl.startsWith('/rtcontent')
          || this.navigationUrl.startsWith('/more/charts') || this.navigationUrl.startsWith('/more/chartcontent')
          || this.navigationUrl.startsWith('/more/rtchartcontent')
        )) {
          this.seoService.updateHomePageSeoDetails();
        }
      }
      else if (event instanceof NavigationEnd) {
        //   window.scrollTo(0, 0); Not required added scrollPositionRestoration
        this.commonService.stopPlayerIfApplicable();
      }
    });

    this.commonService.getLanguagesUpdated().subscribe(
      res => {
        this.isLanguagesUpdated = res;
      });

    this.commonService.getLoadFooterVal()
      .subscribe((resp: boolean) => {
        if(resp){
          this.canLoadFooter = true;
        }
        if (this.canLoadFooter && this.isbannerLoaded && this.isSliderLoaded) {
          this.loadFooter();
        }
      });
  }

  private getBannerGroup(url: string): void {
    if (url == '/rtstore') {
      this.translate.get("pwa.rtstore.banner.group").subscribe(res => {
        this.bannerGroup = res;
      });
      this.isRTContent = true;
    }
    else {
      this.translate.get("pwa.home.banner.group").subscribe(res => {
        this.bannerGroup = res;
      });
      this.isRTContent = false;
    }
  }

  private getConfigDetails(): void {
    let title = this.translate.instant('pwa.title.text');
    this.titleService.setTitle(title);
    this.poweredByText = this.translate.instant('pwa.loading.page.poweredby.text');
    this.yourFavSongText = this.translate.instant('pwa.loading.page.fav.song.text');
    let contentLanguage = this.translate.instant('pwa.default.content.language');
    this.appService.updateContentLanguages(contentLanguage);
    this.userProfileForClevertap = this.appService.updateUserProfileWithContentLang(this.userProfileForClevertap);
    this.getBannerGroup(this.navigationUrl);
  }

  public updateBannerView(value: boolean): void {
    if (value) {
      this.showBanner = false;
    }
  }

  private setInitialLoadingStatus(): void {
    this.hideLoading = true;
    this.commonService.setIsInitialLoadingCompleted(true);
    if (this.showloginPopup) {
      this.showloginPopup = false;
      this.loadPopUp(true);
    }
    else {
      this.loadPopUp(false);
    }
  }

  private getUpdatedDetails(loggedIn: boolean): void {
    if (loggedIn) {
      this.commonService.checkAndInitializeWorker("myAccountInitial");
      this.commonService.checkAndInitializeWorker("userInfo");
    }
    this.commonService.checkAndUpdateStoreId().subscribe(
      storeRes => {
        this.updateBrowsingLanguages();
        let landingUrl: string = sessionStorage.getItem("landingUrl");
        if (null != landingUrl) {
          sessionStorage.removeItem("landingUrl");
          landingUrl = this.commonService.getUpdatedPathUrl(landingUrl);
        }
        this.getConfigDetails();
        this.commonService.setIsHeaderChecked(true);
        if (this.deviceService.isMobile()) {
          //This must be placed here and logic in clevertap service
          this.appService.updateAutoLoginEventCL(true);
          this.appService.updateNotificationUserCL();
        }

        let arr = this.currentUrl.split('?');
        if (arr.length <= 1 && !arr[1] && sessionStorage.getItem("UtmParamsUpdated") != "true") {
          this.commonService.clearUTMParamsFromCT();
        }

        if (!loggedIn) {
          this.appService.updateNotificationUserCL();
          if (sessionStorage.getItem("PWALaunched") != "true") {
            this.commonService.updateCTPWALaunchedObject();
          }
          if (sessionStorage.getItem("PWALaunchforKPI") != "true") {
            this.commonService.pwaLaunchEvent();
          }
        }

        if (this.enableLoginOnLaunch) {
          if (loggedIn || this.commonService.isPrerenderingEnabled()) {
            this.appService.goToLandingUrl(landingUrl, this.currentUrl);
          }
          else {
            this.showLogin(landingUrl);
          }
        } else {
          this.appService.goToLandingUrl(landingUrl, this.currentUrl);
        }
        this.appService.updateUserProfileCL(loggedIn, this.userProfileForClevertap);
      });
  }

  private updateLoginDestinationUrl(landingUrl: string): void {
    if (!sessionStorage.getItem("loginDestinationUrl")) {
      let loginDestinationUrl = "home";
      if (null != landingUrl) {
        loginDestinationUrl = landingUrl;
      }
      sessionStorage.setItem("loginDestinationUrl", loginDestinationUrl);
    }
  }

  private showLogin(landingUrl: string): void {
    if (this.commonService.skipLoginForSelectedPages(landingUrl)) {
      sessionStorage.removeItem("loginDestinationUrl");
      this.appService.goToLandingUrl(landingUrl, this.currentUrl);
    } else {
      this.updateLoginDestinationUrl(landingUrl);

      if (this.currentUrl.indexOf("header") != -1) {
        this.router.navigateByUrl(landingUrl);
      }
      if (this.hideLoading) {
        this.loadPopUp(true);
      } else {
        this.showloginPopup = true;

        if (this.enableLoginOnLaunch && this.deviceService.isMobile()) {
          this.commonService.setHomeBannerLoadedStatus(true);
        }
      }
    }
  }

  private updateDetailsForMobile(): void {
    let headerRedirectReq: boolean = sessionStorage.getItem("headerRedirectReq") == "true";
    if (this.currentUrl.indexOf("header") == -1 || headerRedirectReq) {
      let contestDecryptFailed: boolean = sessionStorage.getItem("contestDecryptFailed") == "true";
      if (contestDecryptFailed) {
        this.appService.updateAutoLoginEventCL(false);
      }
      this.commonService.isUserLoggedInFromOperatorEnd().subscribe(res => {
        if (res) {
          this.appService.updateLoginEventCL();
          this.appService.updateAlreadyRegisteredEventCL("header", "Retrieved");
          if (this.isBannerEnabled) {
            this.showBanner = true;
          }
          sessionStorage.setItem("landingUrl", this.currentUrl);
          this.getUpdatedDetails(res);
        } else {
          let isHeaderCheckRequired: boolean = this.translate.instant("pwa.header.check.required") == 'true';
          let isOoredoHeaderCheckRequired: boolean = this.translate.instant("pwa.ooredo.header.check.required") == 'true';
          if (this.enableLoginOnLaunch || isHeaderCheckRequired || isOoredoHeaderCheckRequired) {
            this.appService.updateLoginEventCL();
          }
          this.checkInLocalAndUpdateDetails(isHeaderCheckRequired, isOoredoHeaderCheckRequired);

        }
      });

    }
  }

  private checkInLocalAndUpdateDetails(isHeaderCheckRequired: boolean, isOoredoHeaderCheckRequired: boolean): void {
    this.commonService.isUserLoggedIn().subscribe(
      (localRes: boolean) => {
        let wasHeaderUser: boolean = localStorage.getItem("isHeaderUser") == "true";
        let type = 'wifi';
        if (wasHeaderUser) {
          type = 'header';
        }
        if (localRes) {
          this.appService.updateAlreadyRegisteredEventCL(type, "Retrieved");
          if (this.isBannerEnabled) {
            this.showBanner = true;
          }
          this.getUpdatedDetails(localRes);
        }
        else {
          this.appService.updateAlreadyRegisteredEventCL(type, "Not Retrieved");
          let isHeaderRedirected = sessionStorage.getItem("isHeaderRedirected");
          //Redirect only if number is not available in local storage

          if (((isHeaderCheckRequired && !this.commonService.isPrerenderingEnabled()) || isOoredoHeaderCheckRequired)
            && (isHeaderRedirected == null || isHeaderRedirected != 'true')) {
            sessionStorage.setItem("isHeaderRedirected", "true");
            sessionStorage.setItem("landingUrl", this.currentUrl);
            sessionStorage.setItem("headerCheckInitiated", "true");
            if (sessionStorage.getItem("headerRedirectReq") == "true") {
              sessionStorage.removeItem("headerRedirectReq");
            }

            if (isHeaderCheckRequired) {
              this.commonService.checkAndUpdateStoreId().subscribe(
                storeRes => {
                  let headerCheckUrl: string = this.translate.instant("pwa.http.header.check.url");
                  window.location.href = headerCheckUrl;
                });
            } else if (isOoredoHeaderCheckRequired) {
              this.appService.redirectforOoredoOmanHE();
            }
          }
          else {
            if (this.enableLoginOnLaunch) {
              this.getDetailsOrRedirect();
            }
            else {
              this.getUpdatedDetails(false);
            }
          }
        }
      });
  }

  private getDetailsOrRedirect(): void {
    if (this.currentUrl.indexOf("home") != -1) {
      this.getUpdatedDetails(false);
    } else {
      let utmParams = this.translate.instant('pwa.utm.params.list').split(",");
      let redirect: boolean = true;
      if (utmParams != null && utmParams != "pwa.utm.params.list")
        for (let i = 0; i < utmParams.length; i++) {
          if (this.currentUrl.indexOf(utmParams[i]) != -1) {
            redirect = false;
            sessionStorage.setItem("enableLoginOnLaunch", String(this.enableLoginOnLaunch));
            break;
          }
        }

      if (this.currentUrl.indexOf("header") == -1) {
        sessionStorage.setItem("landingUrl", this.currentUrl);
      }
      
      let url: string = this.commonService.getUpdatedPathUrl(this.currentUrl);
      if (this.commonService.skipLoginForSelectedPages(url)) {
        this.getUpdatedDetails(false);
      } else if (redirect) {
        let homeUrl = this.translate.instant("pwa.landing.url");
        window.location.href = homeUrl;
      }
    }
  }

  private updateDetailsForDesktop(): void {
    let contestDecryptFailed: boolean = sessionStorage.getItem("contestDecryptFailed") == "true";
    if (contestDecryptFailed) {
      this.appService.updateAutoLoginEventCL(false);
    }
    this.commonService.isUserLoggedInFromOperatorEnd().subscribe(res => {
      if (res) {
        this.appService.updateLoginEventCL();
        this.appService.updateAlreadyRegisteredEventCL("OperatorApp", "Retrieved");
        if (this.isBannerEnabled) {
          this.showBanner = true;
        }
        sessionStorage.setItem("landingUrl", this.currentUrl);
        this.getUpdatedDetails(res);
      }
      else if (this.enableLoginOnLaunch) {
        this.appService.updateLoginEventCL();
        this.commonService.checkIsUserLoggedInFromBackend().subscribe(
          (loginRes: boolean) => {
            if (loginRes) {
              this.getUpdatedDetails(loginRes);
            } else {
              this.getDetailsOrRedirect();
            }
          });
      }
      else {
        if (sessionStorage.getItem("loggedIn") == "true") {
          this.commonService.checkIsUserLoggedInFromBackend().subscribe(
            (loginRes: boolean) => {
              this.getUpdatedDetails(loginRes);
            });
        } else {
          this.getUpdatedDetails(false);
        }
      }
    });
  }

  private updateBrowsingLanguages(): void {
    let langDetails = this.commonService.getAvailableLanguageDetails();
    let browsingLanguage = localStorage.getItem("browsingLanguage");
    let defaultBrowsingLang = null;
    if (null == browsingLanguage) {
      if (langDetails != null) {
        //If browsing language is not available in local storage then we set default language as first value of language config
        defaultBrowsingLang = langDetails[0].split(":")[0]
        localStorage.setItem("browsingLanguage", defaultBrowsingLang);
        //Updating styles for default language  
        if (langDetails[0].includes("rtl")) {
          this.commonService.checkAndUpdateStyleSheetValue('css/style_ar.min.css');
        } else {
          this.commonService.checkAndUpdateStyleSheetValue('css/style.min.css');
        }
      } else {
        defaultBrowsingLang = "en";
        localStorage.setItem("browsingLanguage", defaultBrowsingLang);
        this.commonService.checkAndUpdateStyleSheetValue('css/style.min.css');
      }
      if (defaultBrowsingLang != 'en') {
        location.reload();
      }
    } else {
      // Here we update the CSS for the available browsing language
      let browsingLangDetails: string = "";
      if (langDetails != null) {
        for (let i = 0; i < langDetails.length; i++) {
          if (langDetails[i].includes(this.browsingLanguage)) {
            browsingLangDetails = langDetails[i].toString();
            break;
          }
        }
      }
      if (browsingLangDetails.includes("rtl")) {
        this.commonService.checkAndUpdateStyleSheetValue('css/style_ar.min.css');
      } else {
        this.commonService.checkAndUpdateStyleSheetValue('css/style.min.css');
      }
    }
  }

  @HostListener('window:appinstalled')
  public updateAppInstalled(): void {
    this.appService.updateAppInstalledCL();
  }

  @HostListener('window:load')
  public loadClevertapScripts(): void {
    setTimeout(() => {
      this.appService.loadClevertapAndGTMScript();
    }, 3000);
  }

  async loadPopUp(isLoginRequired: boolean) {
    if (!this.isPopupInitiated && !this.popupComponentRef) {
      this.isPopupInitiated = true;
      const { PopupComponent } = await import('./popup/popup.component');
      const factory = this.componentFactoryResolver.resolveComponentFactory(PopupComponent);
      this.popupComponentRef = this.vcrPopup.createComponent(factory);
      this.popupComponentRef.instance.isMobile = this.deviceService.isMobile();

      this.popupComponentRef.instance.componentLoaded.subscribe(
        res => {
          this.initiateLogin(isLoginRequired);
        });
    }
  }

  private initiateLogin(isLoginRequired: boolean) {
    if (isLoginRequired) {
      this.commonService.initiateLogin(null, false, "home", null);
    }
  }

  async loadFooter() {
    if (!this.isFooterLoaded && !this.footerComponentRef) {
      this.isFooterLoaded = true;
      const { FooterComponent } = await import('./footer/footer.component');
      const factory = this.componentFactoryResolver.resolveComponentFactory(FooterComponent);
      this.footerComponentRef = this.vcrFooter.createComponent(factory);
      this.commonService.setInitialLoadingAndFooterDisplayStatus(true);
    }
  }

  ngOnDestroy(): void {
    let worker = this.commonService.getCustomWorker();
    if (worker) {
      worker.terminate();
    }
  }

}
