import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '../utils/common.service';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-header-resolver',
  templateUrl: './header-resolver.component.html',
  styleUrls: ['./header-resolver.component.css']
})
export class HeaderResolverComponent implements OnInit {

  constructor(private activatedRoute: ActivatedRoute, private commonService: CommonService,
    private deviceService: DeviceDetectorService) { }

  ngOnInit() {

    this.activatedRoute.queryParams.subscribe(params => {
      let encryptedMsisdn: string = params["token"];
      let tokenKey: string = params["key"];
      let headerCheckInitiated = sessionStorage.getItem("headerCheckInitiated");
      if (this.deviceService.isMobile() && headerCheckInitiated != null && headerCheckInitiated == 'true') {
        sessionStorage.setItem("landingUrl", "home");
        if (encryptedMsisdn != null && encryptedMsisdn != "") {
          sessionStorage.removeItem("storeId");
          this.commonService.updateMsisdnDetails(encryptedMsisdn, tokenKey, false, null)
            .subscribe(res => {
              if (res) {
                sessionStorage.removeItem("headerCheckInitiated");
                this.commonService.setEncryptedMsisdnInLocalStorage(encryptedMsisdn, "true");
                localStorage.setItem("tokenKey", tokenKey);
              }
              this.commonService.setIsHeaderResolved(res);
            });
        }
        else {
          this.commonService.setIsHeaderResolved(false);
        }
      } else {
        if (this.deviceService.isMobile() && headerCheckInitiated == null) {
          sessionStorage.setItem("headerRedirectReq", "true");
          sessionStorage.setItem("landingUrl", "home");
          this.commonService.setIsHeaderRedirectReq(true);
        } else if (this.deviceService.isDesktop()) {
          sessionStorage.setItem("landingUrl", "home");
          this.commonService.setIsHeaderResolved(false);
        }
      }
    });
  }

}
