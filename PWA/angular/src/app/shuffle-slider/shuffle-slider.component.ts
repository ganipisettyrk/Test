import { Component, EventEmitter, HostListener, Input, NgModule, OnInit, Output } from '@angular/core';
import { ContentService } from '../content/content.service';
import { SliderService } from '../slider/slider.service';
import { ClevertapService } from '../utils/clevertap.service';
import { CommonService } from '../utils/common.service';
import { CustomEllipsePipe } from '../utils/custom-ellipse.pipe';
import { CustomTranslateService } from '../utils/custom-translate.service';
import { GTMService } from '../utils/gtm.service';
import { SharedModule } from '../utils/shared.module';

@Component({
  selector: 'app-shuffle-slider',
  templateUrl: './shuffle-slider.component.html',
  styleUrls: ['./shuffle-slider.component.css']
})
export class ShuffleSliderComponent implements OnInit {

  @Input() parentId: string;
  @Input() heading: string;
  @Input() subHeading: string;
  @Input() maxItems: number;
  @Input() defaultImageSize: number;
  @Input() isMobile: boolean;

  @Output() valueNotExists = new EventEmitter<boolean>();

  showMore = false;
  shuffleCharts: any;
  svgBulletHTML: any;
  shufflesSliderImageDefault: string;
  shufflesSliderImageLoading: string;
  isArabic = false;

  imageItemsMap = new Map();
  trackNameSize: number;

  constructor(private sliderService: SliderService, public commonService: CommonService,
    private translate: CustomTranslateService, private contentService: ContentService,
    private clevertapService: ClevertapService, private gtmService: GTMService,
    private customEllipsePipe: CustomEllipsePipe) { }

  ngOnInit() {

    this.translate.get('pwa.shuffles.slider.img.default')
      .subscribe(
        resp => {
          this.trackNameSize = this.translate.instant('pwa.track.name.length.limit');

          this.shufflesSliderImageDefault = resp;
          this.shufflesSliderImageLoading = this.translate.instant('pwa.shuffles.slider.img.loading')
          this.getShuffleItems();
        });
  }

  private getShuffleItems(): void {
    let lang = localStorage.getItem('browsingLanguage');
    let langDetails = this.commonService.getAvailableLanguageDetails();
    if (langDetails != null) {
      for (let i = 0; i < langDetails.length; i++) {
        if (langDetails[i].includes(lang) && langDetails[i].includes("rtl")) {
          this.isArabic = true;
          break;
        }
      }
    }


    this.sliderService.getDynamicChartItems(this.parentId, 0, this.maxItems)
      .subscribe(
        response => {
          if (response && response.items && response.items.length > 0) {
            this.shuffleCharts = response.items[0].items;
            this.imageItemsMap.set(this.shuffleCharts.length - 1, true);
            if (!this.isMobile) {
              this.imageItemsMap.set(this.shuffleCharts.length - 2, true);
            }
            for (var i = 0; i < this.shuffleCharts.length; i++) {
              if (i < this.defaultImageSize) {
                this.imageItemsMap.set(i, true);
              } else {
                if (!this.imageItemsMap.has(i))
                  this.imageItemsMap.set(i, false);
              }
            }
            let totalItemsCount = response.items[0].total_item_count;
            if (totalItemsCount > this.maxItems) {
              this.showMore = true;
            }
            this.svgBulletHTML = this.commonService.getSVGHTMLForJssorBullet();
          } else {
            this.valueNotExists.emit(true);
          }
        },
        error => {
          // console.log('error while fetching shuffleCharts: ' + error);
          this.valueNotExists.emit(true);
        });
  }

  public openShufflePopup(shuffleId: string, type: string, shuffle: any): void {
    this.contentService.getContentMetadata(shuffleId, type, false)
      .subscribe(response => {
        this.commonService.updateCT_SetObject(response, 'Shuffles_Preview');
        this.updateShuffleClickCTEventData(shuffle);
        this.commonService.initiateLoginOrAction(response, 'shuffles', false, null, false);
      });
  }

  updateShuffleClickCTEventData(shuffleItem: any) {
    let shuffleClickCTEventObj = {};
    shuffleClickCTEventObj['Source'] = 'HomePage';
    shuffleClickCTEventObj['Shuffle_id'] = shuffleItem.id;
    shuffleClickCTEventObj['Shuffle_name'] = this.customEllipsePipe.transform(shuffleItem, shuffleItem.type, this.trackNameSize)
    shuffleClickCTEventObj['No._of_tunes'] = shuffleItem.total_item_count;
    shuffleClickCTEventObj['shuffle_language'] = shuffleItem.language;
    this.clevertapService.updateClevertapEvent("Shuffle Click", false, null, shuffleClickCTEventObj);

    let gtmEventObj = JSON.parse(JSON.stringify(shuffleClickCTEventObj));
    if (null != gtmEventObj) {
      gtmEventObj['event'] = 'Shuffle Click';
      this.gtmService.pushGTMEvent(gtmEventObj, false, 'GTM Shuffle Click');
    }
  }

  @HostListener('window:slider-positionChange-event', ['$event'])
  sliderPositionChanged(event) {
    if (event.detail.id == "sliderContainer4") {
      let count = Math.round(event.detail.count);
      if (this.imageItemsMap.get(count) == false) {
        this.imageItemsMap.set(count, true);
      }
      if (this.shuffleCharts && count != this.shuffleCharts.length - 1 && this.imageItemsMap.get(count + 1) == false) {
        this.imageItemsMap.set(count + 1, true);
      }
    }
  }

}

@NgModule({
  imports: [SharedModule],
  declarations: [ShuffleSliderComponent],
  providers: [SliderService]
})
class ShuffleSliderModule {
}