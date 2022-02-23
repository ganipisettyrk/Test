import { Component, EventEmitter, HostListener, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../utils/common.service';
import { CustomTranslateService } from '../utils/custom-translate.service';
import { BannerService } from './banner.service';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.css'],
  providers: [BannerService]

})
export class BannerComponent implements OnInit {

  @Input() bannerGroup: string;
  @Input() defaultImageSize: number;
  @Input() isMobile: boolean;
  @Input() isRTContent: boolean;
  @Output() valueNotExists = new EventEmitter<boolean>();

  bannerItems: any;
  bannerItemsRingback: any[] = [];
  bannerItemsMap = new Map();
  bannerItemsContent: any = [];
  bannerItemsContentMap = new Map();

  bannerImageDefault: string;
  bannerImageLoading: string;

  isInitialLoadingCompleted: boolean = false;

  svgBulletHTML: any;
  svgArrowLeftHTML: any;
  svgArrowRightHTML: any;
  imageItemsMap = new Map();

  jssorSlider: any;

  trackNameSize: number;
  artistAlbumdisplayType: string;
  artistAlbumSize: number;

  constructor(
    private translate: CustomTranslateService, public commonService: CommonService,
    private banneService: BannerService, private router: Router) { }

  ngOnInit() {

    this.commonService.getLatestValueForInitailLoading().subscribe(
      res => {
        //This is required for non home url
        this.isInitialLoadingCompleted = res;
      });

    this.commonService.getIsInitialLoadingCompleted().subscribe(
      res => {
        this.isInitialLoadingCompleted = res;
      });

    this.commonService.getBannerItemsContent().subscribe(
      res => {
        this.bannerItemsContent = res;
        for (let i = 0; i < this.bannerItemsContent.length; i++) {
          this.bannerItemsContentMap.set(this.bannerItemsContent[i].id, this.bannerItemsContent[i]);
        }
      });

    this.getBannerData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (null != changes["bannerGroup"] && !changes["bannerGroup"].isFirstChange()) {
      this.getBannerData();
    }
  }

  private getBannerData(): void {

    let contentLangValuesIds: string = this.commonService.getContentLanguageIdsSelected();

    if (null != contentLangValuesIds && contentLangValuesIds.length != 0) {
      this.banneService.getBannerItems(contentLangValuesIds, this.bannerGroup).subscribe(
        data => {
          this.trackNameSize = this.translate.instant('pwa.track.name.length.limit');
          this.artistAlbumdisplayType = this.translate.instant('pwa.ringback.artistoralbum.display');
          this.artistAlbumSize = this.translate.instant('pwa.ringback.artistoralbum.length.limit');

          if (null != data && null != data.banners) {
            let banner = data.banners;
            this.getBannerImageData();
            if (null != banner.length && banner.length > 0) {
              this.bannerItems = banner;
              this.commonService.setHomeBannerLoadedStatus(true);
              for (var i = 0; i < this.bannerItems.length; i++) {
                if (i < this.defaultImageSize) {
                  this.imageItemsMap.set(i, true);
                } else {
                  this.imageItemsMap.set(i, false);
                }
              }
              if (!this.isMobile) {
                this.imageItemsMap.set(this.bannerItems.length - 1, true);
              }
              this.getRingBackBannerItems();
              this.svgBulletHTML = this.commonService.getSVGHTMLForJssorBullet();
              this.svgArrowLeftHTML = this.commonService.getSVGHTMLForJssorArrowLeft();
              this.svgArrowRightHTML = this.commonService.getSVGHTMLForJssorArrowRight();
            }

          }
          if (this.bannerItems == null) {
            this.commonService.setHomeBannerLoadedStatus(true);
            this.valueNotExists.emit(true);
          }
        },
        error => {
          this.commonService.setHomeBannerLoadedStatus(true);
          this.valueNotExists.emit(true);
        });
    }
  }

  private getRingBackBannerItems(): void {
    let i: number = -1;
    for (let item of this.bannerItems) {
      if (item.type == "ringback" || item.type == "realtone") {
        i++;
        this.bannerItemsMap.set(item.banner_id, i);
        this.bannerItemsRingback.push(item);
      }
    }
    if (this.bannerItemsRingback && this.bannerItemsRingback.length > 0) {
      this.banneService.getBannerContentMetadata(this.bannerItemsRingback, false);
    }
  }

  private getBannerImageData(): void {
    this.translate.get("pwa.banner.img.default").subscribe(res => {
      this.bannerImageDefault = res;
      this.bannerImageLoading = this.translate.instant("pwa.banner.img.loading");
    });
  }

  goToPage(rbt: any) {
    if (rbt.type == 'ringback' || rbt.type == 'realtone') {
      let index = this.bannerItemsMap.get(rbt.banner_id);
      this.commonService.goToContentPage(this.bannerItemsContent, index, this.bannerItemsContent.length, 'Banner_Preview', this.isRTContent);
    }
    else if (rbt.type == 'chart') {
      if (this.isRTContent) {
        this.router.navigateByUrl(this.commonService.getRTChartContentUrl(rbt));
      } else {
        this.router.navigateByUrl(this.commonService.getChartContentUrl(rbt));
      }
    }
    else if (rbt.type.toUpperCase() == 'TP_DYNAMIC_URL') {
      let redirectUrl: string = rbt.id;
      if (redirectUrl.indexOf("%ENCRYPTED_DATA%") != -1) {
        let utm_source = this.translate.instant("pwa.contest.utm.source");
        redirectUrl = redirectUrl.replace("%UTM_SOURCE%", utm_source);
        this.commonService.getContestEncryptedData().subscribe(res => {
          if (res && res.result) {
            redirectUrl = redirectUrl.replace("%ENCRYPTED_DATA%", res.result);
            window.location.href = redirectUrl;
          }
        });
      } else {
        window.location.href = redirectUrl;
      }
    } else if (rbt.type.toUpperCase() == 'TP_STATIC_URL') {
      window.location.href = rbt.id;
    }
  }

  getBannerSliderInstance(value: any) {
    this.jssorSlider = value;
    let isLoggedIn: boolean = sessionStorage.getItem("loggedIn") == "true";
    let enableLoginOnLaunch: boolean = this.translate.instant("pwa.enable.login.on.launch") == 'true';
    if (enableLoginOnLaunch && !isLoggedIn && !this.commonService.isPrerenderingEnabled()) {
      this.jssorSlider.$Pause();
    }
  }

  @HostListener('window:slider-positionChange-event', ['$event'])
  sliderPositionChanged(event) {
    if (event.detail.id == "sliderContainer1") {
      let count = Math.round(event.detail.count);
      if (this.imageItemsMap.get(count) == false) {
        this.imageItemsMap.set(count, true);
      }
      if (this.bannerItems && count != this.bannerItems.length - 1 && this.imageItemsMap.get(count + 1) == false) {
        this.imageItemsMap.set(count + 1, true);
      }
      if (count != 0 && this.imageItemsMap.get(count - 1) == false) {
        this.imageItemsMap.set(count - 1, true);
      }
    }
  }

  playBannerItem(rbt) {
    this.jssorSlider.$Pause();
    this.commonService.toggleAudioControls(this.isRTContent, 'play3b', 'Banner-Preview', rbt);
  }

  @HostListener('window:bannerplayer-stop-event')
  sliderPlay() {
    this.jssorSlider.$Play();
  }

}