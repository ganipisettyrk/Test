import { Component, EventEmitter, HostListener, Input, NgModule, OnInit, Output } from '@angular/core';
import { ChartService } from '../utils/chart.service';
import { CustomTranslateService } from '../utils/custom-translate.service';
import { SharedModule } from '../utils/shared.module';
import { CommonService } from './../utils/common.service';

@Component({
  selector: 'app-chart-slider',
  templateUrl: './chart-slider.component.html',
  styleUrls: ['./chart-slider.component.css']
})
export class ChartSliderComponent implements OnInit {

  chartsData: any;
  subcharts: any;
  chartSliderImageDefault: string;
  chartSliderImageLoading: string;
  showMore = false;
  moreButtonText: string;
  svgBulletHTML: any;

  @Input() chartId: string;
  @Input() chartSliderHeading: string;
  @Input() chartSliderSubheading: string;
  @Input() chartSliderMaxItems: number;
  @Input() defaultImageSize: number;
  @Input() isMobile: boolean;

  @Output() valueNotExists = new EventEmitter<boolean>();
  imageItemsMap = new Map();

  constructor(private chartService: ChartService,
    public commonService: CommonService,
    private translate: CustomTranslateService) { }

  ngOnInit() {

    this.translate.get("pwa.chart.slider.img.default")
      .subscribe(resp => {
        this.chartSliderImageDefault = resp;
        this.chartSliderImageLoading = this.translate.instant('pwa.chart.slider.img.loading');
        this.moreButtonText = this.translate.instant('pwa.more.button.text');
      })

    this.chartService.getChartItems(this.chartId, 0, this.chartSliderMaxItems)
      .subscribe(response => {
        if (null != response && null != response.items && response.items.length > 0) {
          if (response.items[0].type == 'chart') {
            this.chartsData = response;
            this.subcharts = response.items;
            this.imageItemsMap.set(this.subcharts.length - 1, true);
            if (!this.isMobile) {
              this.imageItemsMap.set(this.subcharts.length - 2, true);
            }
            for (var i = 0; i < this.subcharts.length; i++) {
              if (i < this.defaultImageSize) {
                this.imageItemsMap.set(i, true);
              } else {
                if (!this.imageItemsMap.has(i))
                  this.imageItemsMap.set(i, false);
              }
            }
            let totalChartsCount = response.total_item_count;
            if (totalChartsCount > this.chartSliderMaxItems) {
              this.showMore = true;
            }
            this.svgBulletHTML = this.commonService.getSVGHTMLForJssorBullet();
          }
        } else {
          this.valueNotExists.emit(true);
        }
      },
        error => {
          // console.log('error while fetching subcharts: ' + error);
          this.valueNotExists.emit(true);
        });
  }

  getMoreButtonUrl(): string {
    let url = this.commonService.getParentChartUrl(this.chartsData);
    return url;
  }

  @HostListener('window:slider-positionChange-event', ['$event'])
  sliderPositionChanged(event) {
    if (event.detail.id == "sliderContainer7") {
      let count = Math.round(event.detail.count);
      if (this.imageItemsMap.get(count) == false) {
        this.imageItemsMap.set(count, true);
      }
      if (this.subcharts && count != this.subcharts.length - 1 && this.imageItemsMap.get(count + 1) == false) {
        this.imageItemsMap.set(count + 1, true);
      }
    }
  }
}

@NgModule({
  imports: [SharedModule],
  declarations: [ChartSliderComponent],
  providers: [ChartService]
})
class ChartSliderModule {
}
