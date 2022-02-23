import { Component, Input, OnInit } from '@angular/core';
import { CommonService } from 'src/app/utils/common.service';
import { CustomTranslateService } from 'src/app/utils/custom-translate.service';

@Component({
  selector: 'app-ringback-station-content',
  templateUrl: './ringback-station-content.component.html',
  styleUrls: ['./ringback-station-content.component.css']
})
export class RingbackStationContentComponent implements OnInit {

  @Input() ringbackStation: any;
  @Input() isMobile: boolean;
  shuffleItems: any;
  sliderImageDefault: string;
  sliderImageLoading: string;

  sliderWidth: string

  constructor(private translate: CustomTranslateService,
    public commonService: CommonService) { }

  ngOnInit() {

    if (this.ringbackStation && this.ringbackStation.items && this.ringbackStation.items.length > 0) {
      this.getSliderData();
      this.shuffleItems = this.ringbackStation.items;

      let length = 0;
      if (null != this.shuffleItems) {
        length = this.shuffleItems.length;
      }
      if (this.isMobile) {
        this.sliderWidth = (100 * length) + 'px';
      }
      else {
        this.sliderWidth = (140 * length) + 'px';
      }
    }
  }

  private getSliderData(): void {

    this.translate.get("pwa.trending.img.default").subscribe(
      res => {
        this.sliderImageDefault = res;
        this.sliderImageLoading = this.translate.instant("pwa.trending.img.loading");
      });
  }

}
