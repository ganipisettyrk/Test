import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';
import { AuthenticationService } from 'src/app/utils/authentication.service';
import { CommonService } from 'src/app/utils/common.service';
import { CustomTranslateService } from 'src/app/utils/custom-translate.service';

@Component({
  selector: 'app-contest-msisdn-resolver',
  templateUrl: './contest-msisdn-resolver.component.html',
  styleUrls: ['./contest-msisdn-resolver.component.css']
})
export class ContestMsisdnResolverComponent implements OnInit {

  constructor(private activatedRoute: ActivatedRoute, private authService: AuthenticationService,
    private commonService: CommonService, private deviceService: DeviceDetectorService,
    private translate: CustomTranslateService) { }

  ngOnInit() {

    this.activatedRoute.queryParams.subscribe(params => {
      let token = params['token'];
      let storeId = params['storeId'];

      if (null != token) {
        sessionStorage.setItem("landingUrl", "home");

        let params = [];
        token = encodeURIComponent(token);
        params.push({ paramName: 'token', paramValue: token });
        if (storeId) {
          params.push({ paramName: 'storeId', paramValue: storeId });
        }
        if (this.deviceService.isMobile()) {
          let encryptedMsisdn = localStorage.getItem("token");
          if (null != encryptedMsisdn && encryptedMsisdn.length > 0) {
            params.push({ paramName: 'localStorageData', paramValue: encryptedMsisdn });
          }
          let encryptedUUID = localStorage.getItem("uuid");
          if (this.commonService.isUUIDFeatureEnabled() &&
            null != encryptedUUID && encryptedUUID.length > 0) {
            params.push({ paramName: 'uuid', paramValue: encryptedUUID });
          }
        }

        this.authService.decryptMsisdnForContest(params).subscribe(
          response => {
            if (response) {
              if (response.result) {
                sessionStorage.setItem("msisdn_updated", "true");
                sessionStorage.setItem("loggedIn", "true");
                sessionStorage.setItem("contestUser", "true");
                if (storeId) {
                  sessionStorage.setItem("storeId", storeId);
                }
                this.commonService.setIsHeaderResolved(true);
              }
            }
            else {
              this.goToHome();
            }
          },
          error => {
            this.goToHome();
          });

      }

    });
  }

  private goToHome(): void {
    let homeUrl = this.translate.instant("pwa.landing.url");
    sessionStorage.setItem("contestDecryptFailed", "true");
    window.location.href = homeUrl;
  }

}
