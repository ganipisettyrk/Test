import { Component, EventEmitter, Input, OnInit, Output, HostListener } from '@angular/core';
import { ChartService } from '../utils/chart.service';
import { CommonService } from '../utils/common.service';
import { CustomTranslateService } from '../utils/custom-translate.service';
import { SliderService } from './slider.service';
import { RecommendationService } from '../utils/recommendation.service';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.css']
})

export class SliderComponent implements OnInit {

  @Input() Id: string;
  @Input() sliderHeading: string;
  @Input() sliderSubHeading: string;
  @Input() buttonText: string;
  @Input() url: string;
  @Input() type: string;
  @Input() chartId: string;
  @Input() maxItems: number;
  @Input() defaultImageSize: number;
  @Input() isMobile: boolean;

  sliderChartId: string;
  sliderMaxItems: number;
  sliderImageDefault: string;
  sliderImageLoading: string;
  svgBulletHTML: any;
  rbtItems: any;

  showSetBtn = false;
  isInitialLoadingCompleted: boolean = false;
  showMore: boolean = false;

  @Output() valueNotExists = new EventEmitter<boolean>();
  imageItemsMap = new Map();

  trackNameSize: number;
  artistAlbumdisplayType: string;
  artistAlbumSize: number;

  constructor(private translate: CustomTranslateService, public commonService: CommonService,
    private sliderService: SliderService, private chartService: ChartService,
    private recommendationService: RecommendationService) { }

  ngOnInit() {

    this.commonService.getIsInitialLoadingCompleted().subscribe(
      res => {
        setTimeout(() => {
          this.isInitialLoadingCompleted = res;
        }, 1);
      });

    this.commonService.getLatestValueForInitailLoading().subscribe(
      res => {
        setTimeout(() => {
          this.isInitialLoadingCompleted = res;
        }, 2);
      });

    this.commonService.getLanguagesUpdated().subscribe(res => {
      if (res) {
        this.getData();
      }
    });
    this.getData();
  }

  private getData(): void {
    this.trackNameSize = this.translate.instant('pwa.track.name.length.limit');
    this.artistAlbumdisplayType = this.translate.instant('pwa.ringback.artistoralbum.display');
    this.artistAlbumSize = this.translate.instant('pwa.ringback.artistoralbum.length.limit');

    if (this.type == 'dynamicChart') {
      this.getSliderData();
      this.getSliderResponse();
    } else if (this.type == 'azanChart') {
      this.getAzanSliderData();
    } else if (this.type == 'recommendChart') {
      this.getRecommendSliderData();
    }

  }

  private getSliderResponse(): void {
    let showRecommend = this.translate.instant("pwa.home.enable.recommend.section").trim() == 'true';

    this.sliderService.getDynamicChartItems(this.sliderChartId, 0, this.sliderMaxItems)
      .subscribe((data) => {
        if (null != data && null != data.items && null != data.items.length && data.items.length > 0) {
          this.rbtItems = data.items[0].items;
          this.updateImageMap();
          this.svgBulletHTML = this.commonService.getSVGHTMLForJssorBullet();
        }
        else {
          this.valueNotExists.emit(true);
        }
        if (!showRecommend) {
          this.commonService.setHomeSliderLoadedStatus(true);
        }
      },
        (error) => {
          this.valueNotExists.emit(true);
          if (!showRecommend) {
            this.commonService.setHomeSliderLoadedStatus(true);
          }
        }
      );
  }

  private getSliderData(): void {

    this.translate.get("pwa.trending.img.default").subscribe(
      res => {
        this.sliderImageDefault = res;
        this.sliderImageLoading = this.translate.instant("pwa.trending.img.loading");
        this.sliderChartId = this.translate.instant('pwa.home.trending.dynamic.chart.id');
        this.sliderMaxItems = this.translate.instant('pwa.home.trending.dynamic.chart.max.content');
        this.showSetBtn = this.translate.instant('pwa.show.direct.set.button').trim() == 'true';
      });
  }

  private getAzanSliderData(): void {
    this.translate.get('pwa.azan.slider.img.default').subscribe(
      resp => {
        this.sliderImageDefault = resp;
        this.sliderImageLoading = this.translate.instant('pwa.azan.slider.img.loading');
        this.showSetBtn = this.translate.instant('pwa.show.direct.set.button').trim() == 'true';
        this.getSliderResponseForAzan();
      });
  }


  private getSliderResponseForAzan(): void {

    this.chartService.getChartItems(this.chartId, 0, this.maxItems)
      .subscribe(response => {
        if (response && response.items && response.items.length) {
          this.rbtItems = response.items;
          this.updateImageMap();
          let totalItemsCount = response.total_item_count;
          if (totalItemsCount > this.maxItems) {
            this.showMore = true;
          }
          this.svgBulletHTML = this.commonService.getSVGHTMLForJssorBullet();
        } else {
          this.valueNotExists.emit(true);
        }
      },
        error => {
          this.valueNotExists.emit(true);
        });
  }

  private getRecommendSliderData(): void {
    this.translate.get('pwa.recommend.slider.img.default').subscribe(
      resp => {
        this.sliderImageDefault = resp;
        this.sliderImageLoading = this.translate.instant('pwa.recommend.slider.img.loading');
        this.showSetBtn = this.translate.instant('pwa.show.direct.set.button').trim() == 'true';
        this.getSliderResponseForRecommend();
      });
  }


  private getSliderResponseForRecommend(): void {
    let contentIds: string = localStorage.getItem("contentIds");

    this.recommendationService.getMultiContentRecommendations(contentIds, 0, this.maxItems, null)
      .subscribe((data) => {
        if (null != data && null != data.items && null != data.items.length && data.items.length > 0) {
          this.rbtItems = data.items;
          this.updateImageMap();
          let totalItemsCount = data.total_item_count;
          if (totalItemsCount > this.maxItems) {
            this.showMore = true;
          }
          this.svgBulletHTML = this.commonService.getSVGHTMLForJssorBullet();
        }
        else {
          this.valueNotExists.emit(true);
        }
        this.commonService.setHomeSliderLoadedStatus(true);
      },
        (error) => {
          this.valueNotExists.emit(true);
          this.commonService.setHomeSliderLoadedStatus(true);
        }
      );
  }

  goToContentPage(rbtItems: any, i: number): void {

    if (this.type == 'dynamicChart') {
      this.commonService.goToContentPage(rbtItems, i, rbtItems.length, 'Trending-Preview', false);
    }
    else if (this.type == 'azanChart') {
      this.commonService.goToContentPage(rbtItems, i, rbtItems.length, 'Azan-Preview', false);
    }
    else if (this.type == 'recommendChart') {
      this.commonService.goToContentPage(rbtItems, i, rbtItems.length, 'Recommendation-Preview ', false);
    }
  }

  @HostListener('window:slider-positionChange-event', ['$event'])
  sliderPositionChanged(event) {
    if (event.detail.id == "sliderContainer2" || event.detail.id == "sliderContainer5" || event.detail.id == "sliderContainer8") {
      let count = Math.round(event.detail.count);
      if (this.imageItemsMap.get(count) == false) {
        this.imageItemsMap.set(count, true);
      }
      if (this.rbtItems && count != this.rbtItems.length - 1 && this.imageItemsMap.get(count + 1) == false) {
        this.imageItemsMap.set(count + 1, true);
      }
    }
  }

  private updateImageMap(): void {
    this.imageItemsMap.set(this.rbtItems.length - 1, true);

    if (!this.isMobile) {
      this.imageItemsMap.set(this.rbtItems.length - 2, true);
      this.imageItemsMap.set(this.rbtItems.length - 3, true);
      this.imageItemsMap.set(this.rbtItems.length - 4, true);
    }
    for (var i = 0; i <= this.rbtItems.length; i++) {
      if (i < this.defaultImageSize) {
        this.imageItemsMap.set(i, true);
      } else {
        if (!this.imageItemsMap.has(i))
          this.imageItemsMap.set(i, false);
      }
    }
  }
}
