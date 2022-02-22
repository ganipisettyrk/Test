import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/utils/authentication.service';
import { CommonService } from 'src/app/utils/common.service';
import { CustomTranslateService } from 'src/app/utils/custom-translate.service';
import { PopupDataItem, PopupService } from '../popup.service';

@Component({
  selector: 'app-data-popup',
  templateUrl: './data-popup.component.html',
  styleUrls: ['./data-popup.component.css']
})
export class DataPopupComponent implements OnInit {

  @Input() isMobile: boolean;
  @Input() heading: string;
  @Output() closeStatus = new EventEmitter<boolean>();
  type: string;

  isLoggedIn: boolean = false;
  initiatePurchase: boolean = false;
  isConsentFlow: boolean = false;
  hideContentImage: boolean = false;
  isSetForNone = false;
  isPaytmFlow = false;

  item: any;
  defaultImage: string;
  showCreateNameTuneScreen: boolean = false;
  shuffleData: any;

  hideHeading: boolean = false;

  trackNameSize: number;
  artistAlbumdisplayType: string;
  artistAlbumSize: number;
  shuffleDisplaySize: number;

  private loggedInSub: Subscription;

  constructor(private popupService: PopupService, private translate: CustomTranslateService,
    private authenticationService: AuthenticationService, public commonService: CommonService,
    private router: Router) { }

  ngOnInit() {

    this.getInitialData();

    this.loggedInSub = this.authenticationService.getLoggedInResult().subscribe(
      res => {
        if (res) {
          this.isLoggedIn = true;
          if (this.type == 'userfeedback' || this.type == 'activity'
            || this.type == 'myaccount') {
            this.closeStatus.emit(true);
            this.router.navigateByUrl(this.type);
          } else if (this.type == 'consent') {
            this.isConsentFlow = true;
          } else if (this.type == 'nametuneCreate') {
            this.showCreateNameTuneScreen = true;
          } else if (this.type == 'home') {
            location.reload();
            this.closeStatus.emit(true);
          } else if (this.type == 'changenumber') {
            this.closeStatus.emit(true);
            if (this.router.url == '/home') {
              location.reload();
            } else if (this.router.url.startsWith('/home')) {
              let homeUrl = this.translate.instant("pwa.landing.url");
              window.location.href = homeUrl;
            }
            else {
              this.router.navigateByUrl('home');
            }
          } else {
            this.initiatePurchase = true;
          }
        }
      });

    this.commonService.getHidePopupContentImage()
      .subscribe(resp => {
        this.hideContentImage = resp;
      });
  }

  getInitialData(): void {

    let invalidMSISDNDescription = sessionStorage.getItem("blockedDescription");
    if (null != invalidMSISDNDescription) {
      this.hideHeading = true;
    }

    if (this.type == "blockedUser") {
      this.hideHeading = true;
    }

    let popupDataItem: PopupDataItem = this.popupService.getPopUpDataItem();
    this.type = popupDataItem.type;
    this.item = popupDataItem.popupData;
    this.isSetForNone = popupDataItem.isSetForNone;
    this.isLoggedIn = popupDataItem.isLoggedIn;

    if (this.type != "language" && this.type != "nametunesearch" && this.type != "blockedUser"
      && this.type != "changenumber") {
      this.translate.get("pwa.login.img.default").subscribe(res => {
        this.defaultImage = res;

        this.trackNameSize = this.translate.instant('pwa.track.name.length.limit');
        this.artistAlbumdisplayType = this.translate.instant('pwa.ringback.artistoralbum.display');
        this.artistAlbumSize = this.translate.instant('pwa.ringback.artistoralbum.length.limit');
        this.shuffleDisplaySize = this.translate.instant('pwa.track.name.length.limit.shuffle');

        if (this.isLoggedIn) {
          if (this.type == 'consent') {
            this.isConsentFlow = true;
          } else if (this.type == 'paytm_resp') {
            this.isPaytmFlow = true;
          } else {
            //only for this case shuffledata must be set & this avoids twice content hit
            if (popupDataItem.pageName == 'shuffles') {
              this.shuffleData = this.item;
            }
            this.initiatePurchase = true;
          }
        }
      });
    }
  }

  updateProfileContentItem(event: any) {
    this.item = event;
  }

  updateDataFromNametune(value: boolean): void {
    if (value) {
      this.getInitialData();
    }
  }

  ngOnDestroy() {
    this.loggedInSub.unsubscribe();
  }

}
