import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ToasterMessageService } from '../toaster-message/toaster-message.service';
import { ChartService } from '../utils/chart.service';
import { CommonService } from '../utils/common.service';
import { CustomEllipsePipe } from '../utils/custom-ellipse.pipe';
import { CustomTranslateService } from '../utils/custom-translate.service';
import { SeoService } from '../utils/seo.service';
import { ContentService } from './content.service';

declare var $: any;

export enum KEY_CODE {
  RIGHT_ARROW = 39,
  LEFT_ARROW = 37
}

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})

export class ContentComponent implements OnInit {
  contentObj: any;
  recContentId: any;
  recAlbumName: any;
  recItems: any;
  showRecommendations = false;
  showMoreButton = false;
  isContentPageLoaded = false;
  corouselItems: any = [];
  corouselItemCount: number;
  totalItemsCount: number;
  contentSliderImage: string;
  contentIndex: number;
  chartId: any;
  jssorSlider: any;
  contentId: string;
  contentType: string;
  showVideoOption = false;
  showGenericError: boolean = false;
  isRTContent: boolean = false;
  currentPosition: number;
  previousPosition: number;
  imageAltText: string;
  isStoryEnabled: boolean = false;
  storyDesc: string;
  isOnStoryView: boolean = false;
  trackNameSize: number;
  artistAlbumdisplayType: string;
  artistAlbumSize: number;
  currentUrl: string;

  constructor(private router: Router, private translate: CustomTranslateService, private contentService: ContentService,
    public commonService: CommonService, private chartService: ChartService,
    private activatedRoute: ActivatedRoute, private toasterMessageService: ToasterMessageService,
    private deviceService: DeviceDetectorService, private seoService: SeoService,
    private customEllipsePipe: CustomEllipsePipe) { }

  ngOnInit() {
    this.commonService.getIsHeaderChecked().subscribe(result => {
      if (result) {
        this.getContentPageDetails();
      }
    });
  }

  getContentPageDetails(): void {

    this.activatedRoute.params
      .subscribe(
        params => {
          let isReloadRequired: boolean = this.commonService.checkIfReloadRequired();
          if (isReloadRequired) {
            location.reload();
          }
          else {
            this.getContentDetailsForParams(params);
          }
        });
  }

  getContentDetailsForParams(params: any): void {
    if (this.activatedRoute.snapshot.data['rtcontent']) {
      if ((this.deviceService.isMobile() && this.deviceService.os == 'Android') || (this.deviceService.isTablet() && this.deviceService.os == 'Android')
        || (this.deviceService.isDesktop() && this.deviceService.os != 'Mac')) {
        this.isRTContent = true;
      }
    }

    //This is required if rtpage is accessed in desktop mode & it is disabled in desktop
    let hidePage: boolean = false;

    let rtToggleForDesktop: boolean = this.translate.instant("pwa.disable.rt.for.desktop") == 'true';

    if (this.deviceService.isDesktop() && rtToggleForDesktop && this.isRTContent) {
      hidePage = true;
    }

    if (!hidePage) {
      this.contentId = params['param1'];
      this.contentType = params['param2'];
      if (params['param3'] && params['param3'] != "" && params['param3'] != " ") {
        this.contentIndex = params['param3'];
      }
      if (params['param4'] && params['param4'] != "" && params['param4'] != " ") {
        this.chartId = params['param4']
      }

      this.updateStoryScripts();
      this.getRecommendationDetails();
    }

  }

  updateStoryScripts(): void {

    this.currentUrl = this.router.url;
    if (this.currentUrl.includes("#story")) {
      this.isOnStoryView = true;
      $(document.getElementById("playerSection")).addClass("story_container");
      $(document.getElementById("story_btn")).addClass("select");
      $(document.getElementById("music_btn")).removeClass("select");
    }
  }

  getRecommendationDetails(): void {

    this.translate.get('pwa.content.enable.recommendations.section')
      .subscribe((resp: string) => {
        this.trackNameSize = this.translate.instant('pwa.track.name.length.limit');
        this.artistAlbumdisplayType = this.translate.instant('pwa.ringback.artistoralbum.display');
        this.artistAlbumSize = this.translate.instant('pwa.ringback.artistoralbum.length.limit');
        this.imageAltText = this.translate.instant('pwa.image.alt.text');
        this.showRecommendations = resp === 'true';
        this.showVideoOption = this.translate.instant('pwa.content.page.show.video.option') == 'true';
        this.isStoryEnabled = this.translate.instant('pwa.content.page.show.story.option') == 'true';
        this.contentSliderImage = this.translate.instant('pwa.content.img.default');

        this.getDetails();

        if (this.showGenericError) {
          this.commonService.getGenericErrorDescription().subscribe(
            res => {
              this.toasterMessageService.toggleToasterMessageDisplay(true, "error", res);
            }
          );
        }
      });
  }

  getDetails(): void {
    let isdeeplink = false;

    if (!this.contentIndex) {
      isdeeplink = true;
    }
    this.showGenericError = false;

    if (isdeeplink) {
      if (this.contentId && this.contentType) {
        this.getDeeplinkContentDetails();
      }
      else {
        this.showGenericError = true;
      }
    }
    else {
      if (this.contentIndex) {
        let reload = sessionStorage.getItem("reload");
        if (reload && reload == "true") {
          sessionStorage.setItem("reload", "false");
          location.reload();
        }
        else {
          this.corouselItems = this.commonService.getCorouselItems();
          if (null == this.corouselItems) {
            this.corouselItems = JSON.parse(sessionStorage.getItem("corouselItem"));
          } else {
            sessionStorage.setItem("corouselItem", JSON.stringify(this.corouselItems));
          }
          if (null != this.corouselItems) {
            this.corouselItemCount = this.corouselItems.length;
            this.totalItemsCount = this.commonService.getTotalItemsCount();
            if (this.corouselItemCount >= this.contentIndex) {
              this.contentObj = this.corouselItems[this.contentIndex];
              this.seoService.updateContentPageSeoDetails(this.contentObj);
              this.recContentId = this.contentObj.id;
              this.recAlbumName = this.contentObj.album_name;
              this.storyDesc = this.contentObj.blog;
            } else {
              this.showGenericError = true;
            }
            this.commonService.setFooterDisplayStatus(true);
            this.commonService.setLoadFooterVal(true);
          }
          else {
            if (this.contentId && this.contentType) {
              this.getDeeplinkContentDetails();
            }
            else {
              this.showGenericError = true;
            }
          }
        }
      }
    }
  }

  getDeeplinkContentDetails(): void {

    this.contentService.getContentMetadata(this.contentId, this.contentType, false)
      .subscribe(response => {
        if (null != response) {
          if (response.status != 'failure') {
            this.contentObj = response;
            this.seoService.updateContentPageSeoDetails(this.contentObj);
            this.recContentId = this.contentObj.id;
            this.recAlbumName = this.contentObj.album_name;
            this.corouselItems = [];
            this.corouselItems[0] = this.contentObj;
            this.corouselItemCount = 1;
            this.contentIndex = 0;
            this.storyDesc = this.contentObj.blog;
            this.commonService.updateCT_SetObject(this.contentObj, 'deeplink');
          }
          else {
            this.toasterMessageService.toggleToasterMessageDisplay(true, "error", response.description);
          }
        } else {
          this.showGenericError = true;
        }
        this.commonService.setFooterDisplayStatus(true);
        this.commonService.setLoadFooterVal(true);
      }, error => {
        this.showGenericError = true;
      });
  }

  getMoreButtonUrl(contentId: string, albumName: string): string {
    let url = "/more/recommendations/" + contentId + "/" + albumName;
    return url;
  }

  moveSliderRight() {
    if (this.corouselItemCount > 1) {
      this.commonService.stopPlayerIfApplicable();
      this.contentIndex = this.jssorSlider.$CurrentIndex() + 1;
      if (this.contentIndex == this.totalItemsCount) {
        this.contentIndex = 0;
      }
      if (this.contentIndex == this.corouselItemCount - 2 && this.corouselItemCount < this.totalItemsCount) {
        this.appendItemsInCorousel(this.corouselItems.length);
      }
      this.jssorSlider.$Next();
      this.getStoryForContent();
    }
  }

  moveSliderLeft() {
    if (this.corouselItemCount > 1) {
      this.commonService.stopPlayerIfApplicable();
      this.contentIndex = this.jssorSlider.$CurrentIndex() - 1;
      if (this.contentIndex < 0) {
        this.contentIndex = this.totalItemsCount - 1;
      }
      this.jssorSlider.$Prev();
      this.getStoryForContent();
    }
  }

  getCurrentSliderIndexAndPlay() {
    let contentIndex = this.jssorSlider.$CurrentIndex();
    let corouselItem = this.corouselItems[contentIndex];
    this.commonService.toggleAudioControls(this.isRTContent, 'play2b', 'Player-Page-Preview', corouselItem);
  }

  getContentSliderInstance(value: any) {
    this.jssorSlider = value;
  }

  appendItemsInCorousel(length) {
    if (null != this.chartId) {
      this.chartService.getChartItems(this.chartId, length, length).subscribe(
        resp => {
          let nextItems = resp.items;
          this.corouselItemCount += nextItems.length;
          let htmlSlides = '';
          for (let i = 0; i < nextItems.length; i++) {
            htmlSlides += this.appendCorouselItemHtml(nextItems[i]);
          }
          this.jssorSlider.$AppendSlides(htmlSlides, this.jssorSlider.$SlidesCount());
        }, 
        error => {
          this.router.navigateByUrl('/error');
        });
    }
  }

  appendCorouselItemHtml(item: any) {
    let slidesHtml = '<div> '
      + '<div class="blur_outer">'
      + '<div class="blur_image">'
      + '<img src="' + item.primary_image + '" alt = "' + this.imageAltText + '" width="183" height="183" class="blur">'
      + '</div>'
      + '<div class="image">'
      + '<div class="play_container_small">'
      + '</div>'
      + '<img src="' + item.primary_image + '" alt = "' + this.imageAltText + '" width="800" height="800" />'
      + '</div>'
      + '<div class="player_artist_name">' + this.customEllipsePipe.transform(item, item.type, this.trackNameSize) + '</div>'
      + '<div class="player_album_name">' + this.customEllipsePipe.transform(item, this.artistAlbumdisplayType, this.artistAlbumSize) + '</div>'
      + '<div class="player_set_btn">'
      + '<a href="javascript:void(0)" class="one_open">'
      + '<div class="fill_btn">Set</div>'
      + '</a>'
      + '</div>'
      + '</div>'
      + '</div>';
    return slidesHtml;
  }

  getCurrentSliderIndexAndInititatePurchase(isRTContent) {
    let contentIndex = this.jssorSlider.$CurrentIndex();
    this.commonService.initiateLoginOrAction(this.corouselItems[contentIndex], null, isRTContent, null, false);
  }

  showOrHideStoryPage(data: boolean) {
    if (data) {
      this.isOnStoryView = true;
      $(document.getElementById("playerSection")).addClass("story_container");
      $(document.getElementById("story_btn")).addClass("select");
      $(document.getElementById("music_btn")).removeClass("select");
      if (!this.currentUrl.includes("#story")) {
        this.currentUrl = this.currentUrl + "#story";
      }
      this.router.navigateByUrl(this.currentUrl);
    }
    else {
      this.isOnStoryView = false;
      $(document.getElementById("playerSection")).removeClass("story_container");
      $(document.getElementById("music_btn")).addClass("select");
      $(document.getElementById("story_btn")).removeClass("select");
      if (this.currentUrl.includes("#story")) {
        this.currentUrl = this.currentUrl.replace("#story", "");
      }
      this.router.navigateByUrl(this.currentUrl);
    }
  }

  getStoryForContent() {
    let item = this.corouselItems[this.contentIndex];
    if (item) {
      this.storyDesc = item.blog;
    }
    if (this.isOnStoryView && !this.storyDesc) {
      this.isOnStoryView = false;
      $(document.getElementById("playerSection")).removeClass("story_container");
      $(document.getElementById("music_btn")).addClass("select");
      $(document.getElementById("story_btn")).removeClass("select");
      this.commonService.goToContentPage(this.corouselItems, this.contentIndex, this.corouselItems.length, null, this.isRTContent);
    }
  }

  @HostListener('window:keyup', ['$event'])
  sliderDraggedWithKeys(event: KeyboardEvent) {
    if (null != this.totalItemsCount) {
      if (event.keyCode == KEY_CODE.RIGHT_ARROW) {
        this.moveSliderRight();

      } else if (event.keyCode == KEY_CODE.LEFT_ARROW) {
        this.moveSliderLeft();
      }
    }
  }
  @HostListener('window:slider-drag-event')
  sliderDragged() {
    this.commonService.stopPlayerIfApplicable();

    if (this.currentPosition > this.previousPosition) {
      this.contentIndex = this.jssorSlider.$CurrentIndex() + 1;
      if (this.contentIndex == this.totalItemsCount) {
        this.contentIndex = 0;
      }
    } else {
      this.contentIndex = this.jssorSlider.$CurrentIndex() - 1;
      if (this.contentIndex < 0) {
        this.contentIndex = this.totalItemsCount - 1;
      }
    }
    if (null != this.totalItemsCount) {
      let currentIndex = this.jssorSlider.$CurrentIndex();
      let totalSlidesCount = this.jssorSlider.$SlidesCount();
      if (currentIndex == totalSlidesCount - 2 && totalSlidesCount < this.totalItemsCount) {
        this.appendItemsInCorousel(totalSlidesCount);
      }
    }
    this.getStoryForContent();
  }

  @HostListener('window:slider-positionChange-event', ['$event'])
  sliderPositionChanged(event) {
    if (event.detail.id == "sliderContainer6") {
      this.currentPosition = event.detail.count;
      this.previousPosition = event.detail.prevoius;
    }
  }

}
