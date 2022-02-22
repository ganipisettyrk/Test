import { Component, Input, OnInit } from '@angular/core';
import { MenuService } from 'src/app/header/menu/menu.service';
import { SearchService } from 'src/app/search/search.service';
import { UserActivityService } from 'src/app/user-activity/user-activity.service';
import { CommonService } from 'src/app/utils/common.service';
import { CustomTranslateService } from 'src/app/utils/custom-translate.service';

@Component({
  selector: 'app-rt-slider',
  templateUrl: './rt-slider.component.html',
  styleUrls: ['./rt-slider.component.css']
})
export class RtSliderComponent implements OnInit {

  @Input() default: string;
  @Input() loadingCheckRequired: boolean;
  @Input() isFromHome: boolean;
  @Input() isFromActivity: boolean;
  @Input() isFromSearch: boolean;
  @Input() isFromSearchResults: boolean;
  @Input() isFromMyaccount: boolean;

  isInitialLoadingCompleted: boolean = false;
  ctText: string;
  rtText: string;

  constructor(private translate: CustomTranslateService,
    private commonService: CommonService,
    private userActivityService: UserActivityService,
    private searchService: SearchService,
    private menuService: MenuService) { }

  ngOnInit() {

    this.commonService.getIsInitialLoadingCompleted().subscribe(
      res => {
        setTimeout(() => {
          this.isInitialLoadingCompleted = res;
        }, 1);
      });

    this.commonService.getHomeBannerLoadedStatus().subscribe(
      res => {
        setTimeout(() => {
          if (!this.isFromHome) {
            this.isInitialLoadingCompleted = res;
          }
        }, 1);
      });

    if (!this.loadingCheckRequired) {
      this.isInitialLoadingCompleted = true;
    }
    let fromStore: boolean = sessionStorage.getItem("FromStore") == "true";

    if (fromStore) {
      this.isInitialLoadingCompleted = true;
      sessionStorage.removeItem("FromStore");
    }

    this.getData();
  }

  private getData(): void {

    this.translate.get("pwa.rt.display.text.callertune").subscribe(
      res => {
        this.ctText = res;
        this.rtText = this.translate.instant("pwa.rt.display.text.ringtone");
      });
  }

  public goToPage(type: string): void {
    if (type != this.default) {
      this.commonService.stopPlayerIfApplicable();
      if (this.isFromSearchResults || this.isFromSearch) {
        this.searchService.setRTToggleSelection(type);
        sessionStorage.setItem('USER_SELECTED_CONTENT', type);
      } else if (this.isFromMyaccount) {
        this.menuService.setAccountToggle(type);
      } else if (this.isFromActivity) {
        this.userActivityService.setActivityToggle(type);
      } else {
        if (type == 'rt') {
          let baseUrl: string = this.translate.instant("pwa.landing.url").trim();
          baseUrl = baseUrl.replace("home", "");
          window.location.href = baseUrl + "rtstore";
        }
        else if (type == 'ct') {
          this.commonService.goToURL("/home");
        }
      }

    }

  }
}
