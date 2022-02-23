import { Component, OnInit } from '@angular/core';
import { ChartService } from 'src/app/utils/chart.service';
import { CommonService } from 'src/app/utils/common.service';
import { CustomTranslateService } from 'src/app/utils/custom-translate.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rt-store',
  templateUrl: './rt-store.component.html',
  styleUrls: ['./rt-store.component.css']
})
export class RtStoreComponent implements OnInit {

  chartsData: any;
  showRTToggle: boolean = false;

  constructor(private translate: CustomTranslateService, private chartService: ChartService,
    public commonService: CommonService, private deviceService: DeviceDetectorService,
    private router: Router) { }

  ngOnInit() {

    this.commonService.getIsHeaderChecked().subscribe(result => {
      if (result) {
        this.translate.get("pwa.disable.rt.for.desktop").subscribe(res => {
          let rtToggleForDesktop: boolean = res.trim() == 'true';
          if ((this.deviceService.isMobile() && this.deviceService.os == 'Android') || (this.deviceService.isTablet() && this.deviceService.os == 'Android')
            || (this.deviceService.isDesktop() && !rtToggleForDesktop && this.deviceService.os != 'Mac')) {

            let isReloadRequired: boolean = this.commonService.checkIfReloadRequired();
            if (isReloadRequired) {
              location.reload();
            }
            else {
              this.getRTStorePageDetails();
            }
          }
          else {
            this.commonService.goToURL("/store");
          }
        });
      }
    });
  }
  getRTStorePageDetails(): void {

    this.translate.get("pwa.rtstore.parent.chart.id").subscribe(
      (res: string) => {
        let chartId = res;
        let rtToggle = this.translate.instant("pwa.rtstore.enable.rt.toggle").trim() == 'true';
        let rtToggleForDesktop = this.translate.instant("pwa.disable.rt.for.desktop").trim() == 'true';
        if (rtToggle) {
          if ((this.deviceService.isMobile() && this.deviceService.os == 'Android') || (this.deviceService.isTablet() && this.deviceService.os == 'Android')
            || (this.deviceService.isDesktop() && !rtToggleForDesktop && this.deviceService.os != 'Mac')) {
            this.showRTToggle = true;
          }
        }
        let maxItem = this.translate.instant("pwa.rtstore.parent.chart.max.content");
        this.chartService.getChartItems(chartId, 0, maxItem).subscribe(
          (data) => {
            if (null != data && null != data.items && null != data.items.length && data.items.length > 0) {
              let chart = data;
              if (chart.items[0].type == 'chart') {
                this.chartsData = chart.items;
              }
            }
          },
          (error) => {
            this.router.navigateByUrl('/error');
          });
      });
  }
  getMoreButtonUrl(chart: any): string {
    let url = this.commonService.getRTChartContentUrl(chart);
    return url;
  }
}
