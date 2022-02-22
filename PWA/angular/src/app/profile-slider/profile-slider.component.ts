import { Component, EventEmitter, HostListener, Input, NgModule, OnInit, Output } from '@angular/core';
import { ChartService } from '../utils/chart.service';
import { ClevertapService } from '../utils/clevertap.service';
import { CommonService } from '../utils/common.service';
import { CustomTranslateService } from '../utils/custom-translate.service';
import { SharedModule } from '../utils/shared.module';
import { GTMService } from './../utils/gtm.service';

@Component({
  selector: 'app-profile-slider',
  templateUrl: './profile-slider.component.html',
  styleUrls: ['./profile-slider.component.css']
})
export class ProfileSliderComponent implements OnInit {

  @Input() parentId: string;
  @Input() heading: string;
  @Input() subHeading: string;
  @Input() maxItems: number;
  @Input() defaultImageSize: number;
  @Input() isMobile: boolean;

  @Output() valueNotExists = new EventEmitter<boolean>();

  profileCharts: any;
  svgBulletHTML: any;
  showMore = false;
  profilesSliderImageDefault: string;
  profilesSliderImageLoading: string;
  moreButtonText: string;

  profileItems: any;
  imageItemsMap = new Map();

  constructor(public chartService: ChartService, public commonService: CommonService,
    private translate: CustomTranslateService, private clevertapService: ClevertapService,
    private gtmService: GTMService) { }

  ngOnInit() {
    this.translate.get("pwa.profiles.slider.img.default")
      .subscribe(resp => {
        this.profilesSliderImageDefault = resp;
        this.profilesSliderImageLoading = this.translate.instant('pwa.profiles.slider.img.loading');
        this.moreButtonText = this.translate.instant('pwa.more.button.text');
      })

    this.chartService.getProfileItems(this.parentId, 0, this.maxItems)
      .subscribe(response => {
        if (null != response && null != response.items && response.items.length > 0) {
          if (response.items[0].type == 'chart') {
            this.profileCharts = response.items;
            this.imageItemsMap.set(this.profileCharts.length - 1, true);
            if (!this.isMobile) {
              this.imageItemsMap.set(this.profileCharts.length - 2, true);
            }
            for (var i = 0; i < this.profileCharts.length; i++) {
              if (i < this.defaultImageSize) {
                this.imageItemsMap.set(i, true);
              } else {
                if (!this.imageItemsMap.has(i))
                  this.imageItemsMap.set(i, false);
              }
            }
            let totalItemsCount = response.total_item_count;
            if (totalItemsCount > this.maxItems) {
              this.showMore = true;
            }
            this.svgBulletHTML = this.commonService.getSVGHTMLForJssorBullet();
          }
        } else {
          this.valueNotExists.emit(true);
        }
      },
        error => {
          // console.log('error while fetching profileCharts: ' + error);
          this.valueNotExists.emit(true);
        })
  }

  openProfilePopup(chartId, chartItemCount) {
    this.chartService.getProfileItems(chartId, 0, chartItemCount)
      .subscribe(response => {
        this.profileItems = response.items;
        this.commonService.setSelectedProfileItems(this.profileItems);
        this.commonService.updateCT_SetObject(this.profileItems[0], 'Profiles_Preview');
        this.updatePofileClickCTEventData(this.profileItems[0]);
        this.commonService.initiateLoginOrAction(this.profileItems[0], 'profiles', false, null, false);
      });
  }

  updatePofileClickCTEventData(profileItem: any) {
    let profileClickCTEventObj = {};
    profileClickCTEventObj['source'] = 'HomePage';
    profileClickCTEventObj['profile_id'] = profileItem.id;
    profileClickCTEventObj['profile_name'] = profileItem.track_name;
    profileClickCTEventObj['profile_language'] = profileItem.language;
    this.clevertapService.updateClevertapEvent("Profile tune click", false, null, profileClickCTEventObj);
    let profileClickGTMEventObj = {};
    profileClickGTMEventObj = JSON.parse(JSON.stringify(profileClickCTEventObj));
    if (null != profileClickGTMEventObj) {
      profileClickGTMEventObj['event'] = 'Profile tune click';
      this.gtmService.pushGTMEvent(profileClickGTMEventObj, false, 'GTM Profile tune click');
    }
  }

  @HostListener('window:slider-positionChange-event', ['$event'])
  sliderPositionChanged(event) {
    if (event.detail.id == "sliderContainer3") {
      let count = Math.round(event.detail.count);
      if (this.imageItemsMap.get(count) == false) {
        this.imageItemsMap.set(count, true);
      }
      if (this.profileCharts && count != this.profileCharts.length - 1 && this.imageItemsMap.get(count + 1) == false) {
        this.imageItemsMap.set(count + 1, true);
      }
    }
  }
}

@NgModule({
  imports: [SharedModule],
  declarations: [ProfileSliderComponent],
  providers: [ChartService]
})
class ProfileSliderModule {

}
