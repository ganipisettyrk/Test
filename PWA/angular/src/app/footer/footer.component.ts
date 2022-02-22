import { Component, OnInit } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { CommonService } from '../utils/common.service';
import { CustomTranslateService } from '../utils/custom-translate.service';
import { GdprService } from '../utils/gdpr.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  showFooter: boolean = false;
  footerLogoUrl: string;
  isInitialLoadingCompleted: boolean = false;
  showAndroidAppIcon = false;
  showIosAppIcon = false;
  playstoreLink: string;
  appstoreLink: string;
  appStoreRating: string;
  playstoreRating: string;
  enableGDPRPermission: boolean;

  constructor(private translate: CustomTranslateService,
    private deviceService: DeviceDetectorService, public commonService: CommonService,
    private gdprService: GdprService) {
  }

  ngOnInit() {
    this.commonService.getIsInitialLoadingCompleted()
      .subscribe(res => {
        this.updateInitialLoadingStatus(res);
      });

    this.commonService.getLatestValueForInitailLoading()
      .subscribe(res => {
        this.updateInitialLoadingStatus(res);
      });

    this.commonService.getFooterDisplayStatus()
      .subscribe(res => {
        this.showFooter = res;
        let isGDPRConsentApproved: boolean = this.gdprService.checkIfGDPRConsentApproved();
        let isGDPRConsentClosed: boolean = sessionStorage.getItem("GDPRClosed") == 'true';
        let isGDPRConsentAvailable: boolean = false;
        if (isGDPRConsentApproved || isGDPRConsentClosed) {
          isGDPRConsentAvailable = true;
        }
        this.gdprService.setGDPRPermissionVisibility(!isGDPRConsentAvailable);
      });

    this.gdprService.getGDPRPermissionVisibility().subscribe(res => {
      this.enableGDPRPermission = res;
    });

    this.commonService.getInitialLoadingAndFooterDisplayStatus()
      .subscribe(resp => {
        this.isInitialLoadingCompleted = resp;
        this.showFooter = resp;
      });

    this.getFooterData();
  }

  private updateInitialLoadingStatus(res: boolean) {
    let isLoggedIn: boolean = sessionStorage.getItem("loggedIn") == "true";
    let enableLoginOnLaunch: boolean = this.translate.instant("pwa.enable.login.on.launch") == 'true';
    if (enableLoginOnLaunch && !isLoggedIn && !this.commonService.isPrerenderingEnabled()) {
      this.isInitialLoadingCompleted = false;
    } else {
      this.isInitialLoadingCompleted = res;
    }
  }

  getFooterData(): void {
    this.translate.get("pwa.footer.logo.image.click.url")
      .subscribe((res: string) => {
        this.footerLogoUrl = res;

        let androidAppIconEnabled = this.translate.instant('pwa.enable.footer.android.app.icon') == 'true';
        let iOSAppIconEnabled = this.translate.instant('pwa.enable.footer.iOS.app.icon') == 'true';

        if (androidAppIconEnabled && (this.deviceService.isDesktop() || (this.deviceService.isMobile() && this.deviceService.os == 'Android'))) {
          this.showAndroidAppIcon = true;
        }
        if (iOSAppIconEnabled && (this.deviceService.isDesktop() || (this.deviceService.isMobile() && this.deviceService.os == 'iOS'))) {
          this.showIosAppIcon = true;
        }

        this.playstoreLink = this.translate.instant('pwa.playstore.redirection.link');
        this.appstoreLink = this.translate.instant('pwa.appstore.redirection.link');
        this.appStoreRating = this.translate.instant('pwa.appstore.rating.percentage');
        this.playstoreRating = this.translate.instant('pwa.playstore.rating.percentage');
      });
  }

}
