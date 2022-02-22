import { Component, ComponentFactoryResolver, ComponentRef, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { AdvertiseComponent } from '../advertise/advertise.component';
import { ChartSliderComponent } from '../chart-slider/chart-slider.component';
import { NametuneComponent } from '../nametune/nametune.component';
import { ProfileSliderComponent } from '../profile-slider/profile-slider.component';
import { ShuffleSliderComponent } from '../shuffle-slider/shuffle-slider.component';
import { CommonService } from '../utils/common.service';
import { CustomTranslateService } from '../utils/custom-translate.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {

  showTrending: boolean = false;
  showAdvertise: boolean = false;
  showCharts: boolean = false;
  showProfiles: boolean = false;
  showNameTunes: boolean = false;
  showShuffles: boolean = false;
  showAzan: boolean = false;
  showRecommend: boolean = false;
  showRTToggle: boolean = false;
  showFooter: boolean = false;

  trendingSliderHeading: string;
  trendingSliderSubHeading: string;
  trendingButtonText: string;
  trendingButtonUrl: string;
  trendingDefault: number;

  advertiseHeading: string;
  advertiseSubHeading: string;
  advertiseButtonText: string;
  advertiseButtonUrl: string;

  chartsParentId: string;
  chartsHeading: string;
  chartsSubheading: string;
  chartMaxItems: number;
  chartDefault: number;

  profilesParentId: string;
  profilesHeading: string;
  profilesSubheading: string;
  profilesMaxItems: number;
  profilesDefault: number;

  nameTunesHeading: string;
  nameTunesSubHeading: string;

  shufflesHeading: string;
  shufflesSubheading: string;
  shufflesParentId: string;
  shufflesMaxItems: number;
  shufflesDefault: number;

  azanHeading: string;
  azanSubheading: string;
  azanParentId: string;
  azanMaxItems: string;
  azanDefault: number;

  recommendHeading: string;
  recommendSubheading: string;
  recommendMaxItems: number;
  recommendDefault: number;

  isMobile: boolean;
  displayCount: number = 0;
  screenHeight: any;

  displayMap = new Map();
  displayRefMapString = new Map();
  displayRefMapBoolean = new Map();

  chartSliderComponentRef: ComponentRef<ChartSliderComponent>;
  profileSliderComponentRef: ComponentRef<ProfileSliderComponent>;
  nametuneComponentRef: ComponentRef<NametuneComponent>;
  shuffleSliderComponentRef: ComponentRef<ShuffleSliderComponent>;
  advertiseComponentRef: ComponentRef<AdvertiseComponent>;

  @ViewChild('vcrChartSlider', { read: ViewContainerRef }) vcrChartSlider: ViewContainerRef;
  @ViewChild('vcrProfileSlider', { read: ViewContainerRef }) vcrProfileSlider: ViewContainerRef;
  @ViewChild('vcrNametune', { read: ViewContainerRef }) vcrNametune: ViewContainerRef;
  @ViewChild('vcrShuffleSlider', { read: ViewContainerRef }) vcrShuffleSlider: ViewContainerRef;
  @ViewChild('vcrAdvertise', { read: ViewContainerRef }) vcrAdvertise: ViewContainerRef;

  loadMoreInitiated: boolean = false;

  constructor(private translate: CustomTranslateService, private commonService: CommonService,
    private deviceService: DeviceDetectorService, private componentFactoryResolver: ComponentFactoryResolver) { 
      this.screenHeight = window.screen.height;
  }

  ngOnInit() {

    this.isMobile = this.deviceService.isMobile();
    this.commonService.getIsHeaderChecked().subscribe(result => {
      if (result) {
        this.getHomePageData();
        if (this.screenHeight >= 640) {
          this.loadMore();
        }
      }
    });

  }

  getHomePageData(): void {

    let result: boolean = false;
    let canset: boolean = true;
    this.translate.get("pwa.home.enable.trending.section").subscribe(
      (res: string) => {
        let enableLoginOnLaunch: boolean = this.translate.instant("pwa.enable.login.on.launch") == 'true';
        let isLoggedIn: boolean = sessionStorage.getItem("loggedIn") == "true";
        let hideComponentsOnLogin = false;
        if (enableLoginOnLaunch && !isLoggedIn && !this.commonService.isPrerenderingEnabled()) {
          hideComponentsOnLogin = true;
        }

        if (!hideComponentsOnLogin) {
          this.showTrending = (res.trim() == 'true');
          this.showCharts = this.translate.instant("pwa.home.enable.charts.section").trim() == 'true';
          this.showAdvertise = this.translate.instant("pwa.home.enable.advertise.section").trim() == 'true';
          this.showProfiles = this.translate.instant('pwa.home.enable.profiles.section').trim() == 'true';
          this.showNameTunes = this.translate.instant("pwa.home.enable.nametunes.section").trim() == 'true';
          this.showShuffles = this.translate.instant("pwa.home.enable.shuffles.section").trim() == 'true';
          this.showAzan = this.translate.instant("pwa.home.enable.azan.section").trim() == 'true';
          this.showRecommend = this.translate.instant("pwa.home.enable.recommend.section").trim() == 'true';
          let rtToggle = this.translate.instant("pwa.home.enable.rt.toggle").trim() == 'true';
          let rtToggleForDesktop = this.translate.instant("pwa.disable.rt.for.desktop").trim() == 'true';
          
          if (rtToggle) {
            if ((this.deviceService.isMobile() && this.deviceService.os == 'Android') || (this.deviceService.isTablet() && this.deviceService.os == 'Android')
              || (this.deviceService.isDesktop() && !rtToggleForDesktop && this.deviceService.os != 'Mac')) {
              this.showRTToggle = true;
            }
          }

          if (this.showRecommend) {
            canset = false;
            this.recommendHeading = this.translate.instant('pwa.home.recommend.heading');
            this.recommendSubheading = this.translate.instant('pwa.home.recommend.subheading');
            this.recommendMaxItems = this.translate.instant('pwa.home.recommend.max.items');
            if (this.isMobile) {
              this.recommendDefault = 2;
            } else {
              this.recommendDefault = 4;
            }
          } else {
            if (!result && canset) {
              result = this.checkAndSetDisplayMap(this.showTrending, "showTrending");
            }
          }

          if (this.showTrending) {
            canset = false;
            this.trendingSliderHeading = this.translate.instant("pwa.home.trending.heading");
            this.trendingSliderSubHeading = this.translate.instant("pwa.home.trending.subheading");
            this.trendingButtonText = this.translate.instant("pwa.home.trending.store.button.text");
            this.trendingButtonUrl = this.translate.instant("pwa.home.trending.store.button.click.url");
            if (this.isMobile) {
              this.trendingDefault = 2;
            } else {
              this.trendingDefault = 4;
            }
          } else {
            if (!result && canset) {
              result = this.checkAndSetDisplayMap(this.showCharts, "showCharts");
            }
          }

          if (this.showCharts) {
            canset = false;
            this.chartsParentId = this.translate.instant('pwa.home.charts.parent.id');
            this.chartsHeading = this.translate.instant('pwa.home.charts.heading');
            this.chartsSubheading = this.translate.instant('pwa.home.charts.subheading');
            this.chartMaxItems = this.translate.instant('pwa.home.charts.max.items');
            if (this.isMobile) {
              this.chartDefault = 2;
            } else {
              this.chartDefault = 3;
            }
          }
          else {
            if (!result && canset) {
              result = this.checkAndSetDisplayMap(this.showAzan, "showAzan");
            }
          }

          if (this.showAzan) {
            canset = false;
            this.azanParentId = this.translate.instant('pwa.home.azan.parent.id');
            this.azanHeading = this.translate.instant('pwa.home.azan.heading');
            this.azanSubheading = this.translate.instant('pwa.home.azan.subheading');
            this.azanMaxItems = this.translate.instant('pwa.home.azan.max.items');
            if (this.isMobile) {
              this.azanDefault = 2;
            } else {
              this.azanDefault = 4;
            }
          }
          else {
            if (!result && canset) {
              result = this.checkAndSetDisplayMap(this.showProfiles, "showProfiles");
            }
          }

          if (this.showProfiles) {
            canset = false;
            this.profilesParentId = this.translate.instant('pwa.home.profiles.parent.id');
            this.profilesHeading = this.translate.instant('pwa.home.profiles.heading');
            this.profilesSubheading = this.translate.instant('pwa.home.profiles.subheading');
            this.profilesMaxItems = this.translate.instant('pwa.home.profiles.max.items');
            if (this.isMobile) {
              this.profilesDefault = 2;
            } else {
              this.profilesDefault = 3;
            }
          }
          else {
            if (!result && canset) {
              result = this.checkAndSetDisplayMap(this.showNameTunes, "showNameTunes");
            }
          }

          if (this.showNameTunes) {
            canset = false;
            this.nameTunesHeading = this.translate.instant('pwa.home.nametunes.heading');
            this.nameTunesSubHeading = this.translate.instant('pwa.home.nametunes.subheading');

          } else {
            if (!result && canset) {
              result = this.checkAndSetDisplayMap(this.showShuffles, "showShuffles");
            }
          }

          if (this.showShuffles) {
            canset = false;
            this.shufflesParentId = this.translate.instant('pwa.home.shuffles.parent.id');
            this.shufflesHeading = this.translate.instant('pwa.home.shuffles.heading');
            this.shufflesSubheading = this.translate.instant('pwa.home.shuffles.subheading');
            this.shufflesMaxItems = this.translate.instant('pwa.home.shuffles.max.items');
            if (this.isMobile) {
              this.shufflesDefault = 2;
            } else {
              this.shufflesDefault = 3;
            }
          } else {
            if (!result && canset) {
              result = this.checkAndSetDisplayMap(this.showAdvertise, "showAdvertise");
            }
          }

          if (this.showAdvertise) {
            this.advertiseHeading = this.translate.instant("pwa.home.advertise.heading");
            this.advertiseSubHeading = this.translate.instant("pwa.home.advertise.subheading");
            this.advertiseButtonText = this.translate.instant("pwa.home.advertise.button.text");
            this.advertiseButtonUrl = this.translate.instant("pwa.home.advertise.button.click.url");
          }

        }
      }
    );
  }

  updateTrendingSliderView(value: boolean): void {
    if (value) {
      this.showTrending = false;
      this.loadMore();
    }
  }

  updateChartSliderView(value: boolean) {
    if (value) {
      this.showCharts = false;
      this.loadMore();
    }
  }

  updateProfilesSliderView(value: boolean) {
    if (value) {
      this.showProfiles = false;
      this.loadMore();
    }
  }

  updateShufflesSliderView(value: boolean) {
    if (value) {
      this.showShuffles = false;
      this.loadMore();
    }
  }

  updateAzanSliderView(value: boolean) {
    if (value) {
      this.showAzan = false;
      this.loadMore();
    }
  }

  updateRecommendSliderView(value: boolean) {
    if (value) {
      this.showRecommend = false;
      this.loadMore();
    }
  }

  loadMore(): void {
    if (!this.loadMoreInitiated) {
      this.loadMoreInitiated = true;
      if (this.displayCount == 0) {
        this.setValuesForMap();
        if (this.displayMap.get("showAdvertise")) {
          this.displayCount = 7;
        } else if (this.displayMap.get("showShuffles")) {
          this.displayCount = 6;
        } else if (this.displayMap.get("showNameTunes")) {
          this.displayCount = 5;
        } else if (this.displayMap.get("showProfiles")) {
          this.displayCount = 4;
        } else if (this.displayMap.get("showAzan")) {
          this.displayCount = 3;
        } else if (this.displayMap.get("showCharts")) {
          this.displayCount = 2;
        } else if (this.displayMap.get("showTrending")) {
          this.displayCount = 1;
        }
      }
      let result: boolean = false;
      while (!result && this.displayCount < 7) {
        this.displayCount += 1;
        let value: string = this.displayRefMapString.get(this.displayCount);
        let isEnabled: boolean = this.displayRefMapBoolean.get(this.displayCount);
        result = this.checkAndSetDisplayMap(isEnabled, value);
      }

      if (!this.chartSliderComponentRef && this.showCharts && this.displayMap.has('showCharts')) {
        this.loadChartSlider();
        this.showFooter = true;
      }
      else if (!this.profileSliderComponentRef && this.showProfiles && this.displayMap.has('showProfiles')) {
        this.loadProfileSlider();
        this.showFooter = true;
      }
      else if (!this.nametuneComponentRef && this.showNameTunes && this.displayMap.has('showNameTunes')) {
        this.loadNametune();
        this.showFooter = true;
      }
      else if (!this.shuffleSliderComponentRef && this.showShuffles && this.displayMap.has('showShuffles')) {
        this.loadShuffleSlider();
        this.showFooter = true;
      }
      else if (!this.advertiseComponentRef && this.showAdvertise && this.displayMap.has('showAdvertise')) {
        this.loadAdvertise();
        this.showFooter = true;
      }
      else {
        this.loadMoreInitiated = false;
      }
      
      if (this.showFooter) {
        this.commonService.setLoadFooterVal(true);
      }
    }
  }

  private checkAndSetDisplayMap(valuetoVerify: boolean, valuetoSet: string): boolean {

    if (valuetoVerify) {
      this.displayMap.set(valuetoSet, true);
    }
    return valuetoVerify;
  }

  private setValuesForMap() {

    this.displayRefMapString.set(1, "showTrending");
    this.displayRefMapString.set(2, "showCharts");
    this.displayRefMapString.set(3, "showAzan");
    this.displayRefMapString.set(4, "showProfiles");
    this.displayRefMapString.set(5, "showNameTunes");
    this.displayRefMapString.set(6, "showShuffles");
    this.displayRefMapString.set(7, "showAdvertise");

    this.displayRefMapBoolean.set(1, this.showTrending);
    this.displayRefMapBoolean.set(2, this.showCharts);
    this.displayRefMapBoolean.set(3, this.showAzan);
    this.displayRefMapBoolean.set(4, this.showProfiles);
    this.displayRefMapBoolean.set(5, this.showNameTunes);
    this.displayRefMapBoolean.set(6, this.showShuffles);
    this.displayRefMapBoolean.set(7, this.showAdvertise);
  }

  async loadChartSlider() {
    const { ChartSliderComponent } = await import('../chart-slider/chart-slider.component');
    const factory = this.componentFactoryResolver.resolveComponentFactory(ChartSliderComponent);
    this.chartSliderComponentRef = this.vcrChartSlider.createComponent(factory);
    this.chartSliderComponentRef.instance.chartId = this.chartsParentId;
    this.chartSliderComponentRef.instance.chartSliderHeading = this.chartsHeading;
    this.chartSliderComponentRef.instance.chartSliderSubheading = this.chartsSubheading;
    this.chartSliderComponentRef.instance.chartSliderMaxItems = this.chartMaxItems;
    this.chartSliderComponentRef.instance.defaultImageSize = this.chartDefault;
    this.chartSliderComponentRef.instance.isMobile = this.isMobile;
    this.chartSliderComponentRef.instance.valueNotExists.subscribe(res => {
      this.updateChartSliderView(res);
    });
    this.loadMoreInitiated = false;

  }

  async loadProfileSlider() {
    const { ProfileSliderComponent } = await import('../profile-slider/profile-slider.component');
    const factory = this.componentFactoryResolver.resolveComponentFactory(ProfileSliderComponent);
    this.profileSliderComponentRef = this.vcrProfileSlider.createComponent(factory);
    this.profileSliderComponentRef.instance.parentId = this.profilesParentId;
    this.profileSliderComponentRef.instance.heading = this.profilesHeading;
    this.profileSliderComponentRef.instance.subHeading = this.profilesSubheading;
    this.profileSliderComponentRef.instance.maxItems = this.profilesMaxItems;
    this.profileSliderComponentRef.instance.defaultImageSize = this.profilesDefault;
    this.profileSliderComponentRef.instance.isMobile = this.isMobile;
    this.profileSliderComponentRef.instance.valueNotExists.subscribe(res => {
      this.updateProfilesSliderView(res);
    });
    this.loadMoreInitiated = false;

  }

  async loadNametune() {
    const { NametuneComponent } = await import('../nametune/nametune.component');
    const factory = this.componentFactoryResolver.resolveComponentFactory(NametuneComponent);
    this.nametuneComponentRef = this.vcrNametune.createComponent(factory);
    this.nametuneComponentRef.instance.heading = this.nameTunesHeading;
    this.nametuneComponentRef.instance.subHeading = this.nameTunesSubHeading;
    this.loadMoreInitiated = false;

  }

  async loadShuffleSlider() {
    const { ShuffleSliderComponent } = await import('../shuffle-slider/shuffle-slider.component');
    const factory = this.componentFactoryResolver.resolveComponentFactory(ShuffleSliderComponent);
    this.shuffleSliderComponentRef = this.vcrShuffleSlider.createComponent(factory);
    this.shuffleSliderComponentRef.instance.parentId = this.shufflesParentId;
    this.shuffleSliderComponentRef.instance.heading = this.shufflesHeading;
    this.shuffleSliderComponentRef.instance.subHeading = this.shufflesSubheading;
    this.shuffleSliderComponentRef.instance.maxItems = this.shufflesMaxItems;
    this.shuffleSliderComponentRef.instance.defaultImageSize = this.shufflesDefault;
    this.shuffleSliderComponentRef.instance.isMobile = this.isMobile;
    this.shuffleSliderComponentRef.instance.valueNotExists.subscribe(
      res => {
        this.updateShufflesSliderView(res);
      });
    this.loadMoreInitiated = false;
  }

  async loadAdvertise() {
    const { AdvertiseComponent } = await import('../advertise/advertise.component');
    const factory = this.componentFactoryResolver.resolveComponentFactory(AdvertiseComponent);
    this.advertiseComponentRef = this.vcrAdvertise.createComponent(factory);
    this.advertiseComponentRef.instance.heading = this.advertiseHeading;
    this.advertiseComponentRef.instance.subHeading = this.advertiseSubHeading;
    this.advertiseComponentRef.instance.buttonText = this.advertiseButtonText;
    this.advertiseComponentRef.instance.url = this.advertiseButtonUrl;
    this.loadMoreInitiated = false;
  }
}