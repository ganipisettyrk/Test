import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';
import { AuthenticationService } from 'src/app/utils/authentication.service';
import { CommonService } from 'src/app/utils/common.service';

@Component({
  selector: 'app-ooredo-header-resolver',
  templateUrl: './ooredo-header-resolver.component.html',
  styleUrls: ['./ooredo-header-resolver.component.css']
})
export class OoredoHeaderResolverComponent implements OnInit {

  constructor(private activatedRoute: ActivatedRoute, private commonService: CommonService,
    private authService: AuthenticationService, public deviceService: DeviceDetectorService) { }


  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      let token = params['token'];
      let correlatorId = params['correlatorId'];
      let statusCode = params['statusCode'];
      let headerCheckInitiated = sessionStorage.getItem("headerCheckInitiated");

      if (this.deviceService.isMobile() && headerCheckInitiated != null && headerCheckInitiated == 'true') {
        if (statusCode == 1 && token != null) {
          let params = [];
          token = encodeURIComponent(token);
          params.push({ paramName: 'token', paramValue: token });
          params.push({ paramName: 'correlatorId', paramValue: correlatorId });
          this.authService.decryptMsisdnForOoredo(params).subscribe(
            response => {
              if (response && response.encryptedMsisdn) {
                sessionStorage.removeItem("headerCheckInitiated");
                this.commonService.setEncryptedValuesInLocalStorage(response, "true");
                this.commonService.setIsHeaderResolved(true);
              }
              else {
                this.commonService.setIsHeaderResolved(false);
              }
            },
            error => {
              this.commonService.setIsHeaderResolved(false);
            });
        }
        else {
          this.commonService.setIsHeaderResolved(false);
        }
      }
    });
  }
}