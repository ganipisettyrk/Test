import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';
import { CommonService } from '../utils/common.service';

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
        if (!sessionStorage.getItem("landingUrl")) {
          sessionStorage.setItem("landingUrl", "home");
        }
        if (encryptedMsisdn != null && encryptedMsisdn != "") {
          sessionStorage.removeItem("storeId");
          this.commonService.updateMsisdnDetails(encryptedMsisdn, tokenKey, true, false, null)
            .subscribe(res => {
              if (res) {
                this.commonService.setEncryptedMsisdnInLocalStorage(encryptedMsisdn, "true");
                sessionStorage.removeItem("headerCheckInitiated");
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
