import { Component, OnInit } from '@angular/core';
import { ChartService } from '../utils/chart.service';
import { CommonService } from '../utils/common.service';
import { CustomTranslateService } from '../utils/custom-translate.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.css']
})
export class StoreComponent implements OnInit {

  chartsData: any;
  showRTToggle: boolean = false;
  isShuffle: boolean = false;

  constructor(private translate: CustomTranslateService, private chartService: ChartService,
    private activatedRoute: ActivatedRoute, public commonService: CommonService,
    private deviceService: DeviceDetectorService, private router: Router) { }

  ngOnInit() {

    this.commonService.getIsHeaderChecked().subscribe(result => {
      if (result) {
        let isReloadRequired: boolean = this.commonService.checkIfReloadRequired();
        if (isReloadRequired) {
          location.reload();
        }
        else {
          this.getStorePageDetails();
        }
      }
    });
  }
  getStorePageDetails(): void {

    if (this.activatedRoute.snapshot.data['isShuffle']) {
      this.translate.get("pwa.more.shuffle.parent.chart.id")
        .subscribe(resp => {
          let chartId = resp;
          let maxItems = this.translate.instant("pwa.more.shuffle.parent.chart.max.content");
          this.isShuffle = true;
          this.getChartDetails(chartId, maxItems);
        });
    }
    else {
      this.translate.get("pwa.store.parent.chart.id")
        .subscribe(resp => {
          let rtToggle = this.translate.instant("pwa.store.enable.rt.toggle").trim() == 'true';
          let rtToggleForDesktop = this.translate.instant("pwa.disable.rt.for.desktop").trim() == 'true';
          if (rtToggle) {
            if ((this.deviceService.isMobile() && this.deviceService.os == 'Android') || (this.deviceService.isTablet() && this.deviceService.os == 'Android')
              || (this.deviceService.isDesktop() && !rtToggleForDesktop && this.deviceService.os != 'Mac')) {
              this.showRTToggle = true;
            }
          }
          let chartId = resp;
          let maxItems = this.translate.instant("pwa.store.parent.chart.max.content");
          this.getChartDetails(chartId, maxItems);
        });
    }
  }

  private getChartDetails(chartId: string, maxItems: number): void {
    this.chartService.getChartItems(chartId, 0, maxItems).subscribe(
      (data) => {
        if (null != data && null != data.items && null != data.items.length && data.items.length > 0) {
          let chart = data;
          if (chart.items[0].type == 'chart') {
            this.chartsData = chart.items;
          }
        }
      }, error => {
        this.router.navigateByUrl('/error');
      });
  }

  getMoreButtonUrl(chart: any): string {
    let url;
    if (this.isShuffle) {
      url = "/more/" + "shuffle/" + chart.id;
    } else {
      url = this.commonService.getChartContentUrl(chart);
    }
    return url;
  }
}
