import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '../utils/common.service';
import { CustomTranslateService } from '../utils/custom-translate.service';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-more',
  templateUrl: './more.component.html',
  styleUrls: ['./more.component.css']
})
export class MoreComponent implements OnInit {

  type: string;
  chartId: string;
  maxItem: number;
  isRecommendation: boolean = false;
  contentIds: string;
  albumName: string;
  id: string;
  searchText: string;
  searchGenre: string;
  isRTContent: boolean = false;

  constructor(private activatedRoute: ActivatedRoute, private translate: CustomTranslateService,
    private commonService: CommonService, private deviceService: DeviceDetectorService) { }

  ngOnInit() {
    this.commonService.getIsHeaderChecked().subscribe(result => {

      if (result) {
        this.getMorePageDetails();
      }
    });

  }

  getMorePageDetails() {
    if (this.activatedRoute.snapshot.data['rtcontent']) {
      this.checkIfRTContent();
    }
    this.activatedRoute.params.subscribe(params => {
      this.type = params["type"];
      this.id = params["id"];
      if (this.type == "album" || this.type == "artist" || this.type == "song") {
        this.searchText = this.id;
        this.searchGenre = this.type;
      }
      if (this.type == "recommendations" || this.type == "multirecommendations") {
        this.albumName = params["albumName"];
      }
      this.getMoreComponentDetails();
    });
  }

  getMoreComponentDetails() {

    this.translate.get("pwa.more.chart.max.content").subscribe(
      res => {
        this.maxItem = res;
        if (this.type == 'chartcontent' || this.type == 'charts'
          || this.type == 'trending' || this.type == 'profiles'
          || this.type == 'shuffle' || this.type == 'azan' || this.type == 'rtchartcontent') {
          this.chartId = this.id;
          if (this.type == 'rtchartcontent') {
            this.checkIfRTContent();
          }
        }
        else if (this.type == 'recommendations') {
          this.contentIds = this.id;
        }
        else if (this.type == 'multirecommendations') {
          this.contentIds = this.id;
        }
        else if (this.type == 'recommend') {
          this.contentIds = localStorage.getItem("contentIds");
        }
      });
  }

  private checkIfRTContent(): void {
    let rtToggleForDesktop = this.translate.instant("pwa.disable.rt.for.desktop").trim() == 'true';
    if ((this.deviceService.isMobile() && this.deviceService.os == 'Android')
      || (this.deviceService.isTablet() && this.deviceService.os == 'Android')
      || (this.deviceService.isDesktop() && !rtToggleForDesktop && this.deviceService.os != 'Mac')) {
      this.isRTContent = true;
    }
  }

}