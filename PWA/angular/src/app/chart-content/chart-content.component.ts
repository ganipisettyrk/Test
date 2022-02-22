import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { ContentService } from '../content/content.service';
import { SearchService } from '../search/search.service';
import { ChartService } from '../utils/chart.service';
import { CommonService } from '../utils/common.service';
import { CustomTranslateService } from '../utils/custom-translate.service';
import { RecommendationService } from '../utils/recommendation.service';
import { SeoService } from '../utils/seo.service';

@Component({
  selector: 'app-chart-content',
  templateUrl: './chart-content.component.html',
  styleUrls: ['./chart-content.component.css']
})
export class ChartContentComponent implements OnInit {

  @Input() chartId: string;
  @Input() maxItem: number;
  @Input() isRecommendation: boolean;
  @Input() isMultiRecommendations: boolean;
  @Input() isProfiles: boolean;
  @Input() isShuffles: boolean;
  @Input() isAzan: boolean;
  @Input() isRecommend: boolean;
  @Input() contentIds: string;
  @Input() albumName: string;
  @Input() isLoadMoreRequired: boolean;
  @Input() moreButtonUrl: string;
  @Input() isSearchPage: boolean;
  @Input() searchText: string;
  @Input() searchGenre: string;
  @Input() showBackButton: boolean;
  @Input() isTrendingResultsPage: boolean;
  @Input() isRTContent: boolean;

  showMoreButton: boolean = false;
  chartImageDefault: string;
  chartImageLoading: string;
  chartSliderImageDefault: string;
  chartSliderImageLoading: string;
  heading: string;
  chartItem: any;
  showCharts = false;
  showProfileCharts = false;
  showShufflesCharts = false;
  showAzanCharts = false;
  showRecommendChart = false;
  isArabic = false;

  profileItems: any;
  profilesSliderImageDefault: string;
  profilesSliderImageLoading: string;
  shufflesSliderImageDefault: string;
  shufflesSliderImageLoading: string;
  azanSliderImageDefault: string;
  azanSliderImageLoading: string;
  recommendSliderImageDefault: string;
  recommendSliderImageLoading: string;

  offset: number = 0;
  totalItemCount: number = 0;
  showLoadMore: boolean = false;
  showMoreLoaderImage: boolean = false;
  showSetBtn = false;
  showGetBtn = false;

  trackNameSize: number;
  artistAlbumdisplayType: string;
  artistAlbumSize: number;
  shuffleDisplaySize: number;

  constructor(private translate: CustomTranslateService, public commonService: CommonService,
    public chartService: ChartService, private searchService: SearchService,
    private recommendationService: RecommendationService, private contentService: ContentService,
    private seoService: SeoService) { }

  ngOnInit() {
    this.getChartData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (null != changes["chartId"] && !changes["chartId"].isFirstChange()) {
      this.chartItem = [];
      this.offset = 0;
      this.totalItemCount = 0;
      this.heading = null;
      this.showMoreLoaderImage = false;
      this.showLoadMore = false;
      this.showCharts = false;
      this.getChartData();
    }

  }

  getChartData(): void {
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

    this.translate.get("pwa.chart.img.default").subscribe(
      (res: string) => {
        this.chartImageDefault = res;
        this.chartImageLoading = this.translate.instant("pwa.chart.img.loading");
        this.chartSliderImageDefault = this.translate.instant("pwa.chart.slider.img.default");
        this.chartSliderImageLoading = this.translate.instant('pwa.chart.slider.img.loading');
        this.showSetBtn = this.translate.instant('pwa.show.direct.set.button').trim() == 'true';
        this.showGetBtn = this.translate.instant('pwa.show.direct.get.button').trim() == 'true';
        this.trackNameSize = this.translate.instant('pwa.track.name.length.limit');
        this.artistAlbumdisplayType = this.translate.instant('pwa.ringback.artistoralbum.display');
        this.artistAlbumSize = this.translate.instant('pwa.ringback.artistoralbum.length.limit');
        this.shuffleDisplaySize = this.translate.instant('pwa.track.name.length.limit.shuffle');

        if (this.isProfiles) {
          this.profilesSliderImageDefault = this.translate.instant('pwa.profiles.slider.img.default');
          this.profilesSliderImageLoading = this.translate.instant('pwa.profiles.slider.img.loading');
        } else if (this.isShuffles) {
          this.shufflesSliderImageDefault = this.translate.instant('pwa.shuffles.slider.img.default');
          this.shufflesSliderImageLoading = this.translate.instant('pwa.shuffles.slider.img.loading');
        } else if (this.isAzan) {
          this.azanSliderImageDefault = this.translate.instant('pwa.azan.slider.img.default');
          this.azanSliderImageLoading = this.translate.instant('pwa.azan.slider.img.loading');
        } else if (this.isRecommend) {
          this.recommendSliderImageDefault = this.translate.instant('pwa.azan.slider.img.default');
          this.recommendSliderImageLoading = this.translate.instant('pwa.azan.slider.img.loading');
        }
        this.getChartContentDetails();

      });

  }

  updateData(res: any, headingRequired: boolean): void {
    this.totalItemCount = res.total_item_count;
    if (headingRequired) {
      this.heading = res.chart_name;
    }
    if (!this.isLoadMoreRequired) {
      this.chartItem = res.items;
      this.showMoreButton = (this.maxItem < this.totalItemCount) ? true : false;
    }
    else {
      this.offset += res.item_count;
      if (null != this.chartItem) {
        this.chartItem = this.chartItem.concat(res.items);
      }
      else {
        this.chartItem = res.items;
      }
      this.showMoreLoaderImage = false;
      this.updateShowLoadMore();
    }

  }

  updateShowLoadMore(): void {
    if (this.offset >= this.totalItemCount) {
      this.showLoadMore = false;
      this.commonService.setLoadFooterVal(true);
    } else {
      this.showLoadMore = true;
    }
  }

  loadMore(): void {
    if (this.offset >= this.totalItemCount) {
      this.showLoadMore = false;
    } else {
      this.showLoadMore = false;
      this.showMoreLoaderImage = true;
      this.getChartContentDetails();
    }
  }

  getChartContentDetails(): void {

    if (this.isRecommendation) {
      this.recommendationService.getRecommendationItems(this.contentIds, this.albumName, this.offset, this.maxItem)
        .subscribe(
          response => {
            this.heading = this.translate.instant('pwa.content.recommendations.heading.text');
            if (null != response && null != response.items && response.items.length > 0) {
              this.chartItem = response.items;
              this.showMoreButton = (this.maxItem < response.total_item_count) ? true : false;
            }
            else {
              this.showLoadMore = false;
              this.showMoreLoaderImage = false;
            }
            this.commonService.setFooterDisplayStatus(true);
          },
          (error) => {
            this.commonService.setFooterDisplayStatus(true);
          });
    } else if (this.isMultiRecommendations) {
      this.recommendationService.getMultiContentRecommendations(this.contentIds, this.offset, this.maxItem, this.albumName)
        .subscribe(
          response => {
            this.heading = this.translate.instant('pwa.content.recommendations.heading.text');
            if (null != response && null != response.items && response.items.length > 0) {
              this.chartItem = response.items;
              this.updateData(response, false);
            }
            else {
              this.showLoadMore = false;
              this.showMoreLoaderImage = false;
            }
            this.commonService.setFooterDisplayStatus(true);
          },
          (error) => {
            this.commonService.setFooterDisplayStatus(true);
          });
    } else if (this.isRecommend) {
      this.recommendationService.getMultiContentRecommendations(this.contentIds, this.offset, this.maxItem, null)
        .subscribe(
          response => {
            this.heading = this.translate.instant('pwa.content.recommendations.heading.text');
            if (null != response && null != response.items && response.items.length > 0) {
              this.updateData(response, false);
              this.showRecommendChart = true;
            }
            else {
              this.showLoadMore = false;
              this.showMoreLoaderImage = false;
            }
            this.commonService.setFooterDisplayStatus(true);
          },
          (error) => {
            this.commonService.setFooterDisplayStatus(true);
          });
    }
    else if (this.isSearchPage) {

      let contentLangValuesIds: string = this.commonService.getContentLanguageIdsSelected();

      if (null != contentLangValuesIds && contentLangValuesIds.length != 0) {
        this.searchService.getCategorisedSearchResults(this.searchText, this.searchGenre, this.offset,
          this.maxItem, contentLangValuesIds, this.isRTContent).subscribe(
            searchResp => {
              this.heading = this.translate.instant('pwa.' + this.searchGenre + '.search.result.heading');
              if (searchResp) {
                if (this.searchGenre == 'song' && searchResp.song && searchResp.song.items && searchResp.song.items.length > 0) {
                  this.updateData(searchResp.song, false);
                } else if (this.searchGenre == 'album' && searchResp.album && searchResp.album.items && searchResp.album.items.length > 0) {
                  this.updateData(searchResp.album, false);
                } else if (this.searchGenre == 'artist' && searchResp.artist && searchResp.artist.items && searchResp.artist.items.length > 0) {
                  this.updateData(searchResp.artist, false);
                }

              } else {
                this.showLoadMore = false;
                this.showMoreLoaderImage = false;
              }
              this.commonService.setFooterDisplayStatus(true);
            });
      }
    } else if (this.isProfiles) {
      this.chartService.getProfileItems(this.chartId, this.offset, this.maxItem)
        .subscribe(response => {
          if (response && response.items && response.items.length > 0) {
            this.updateData(response, true);
            this.showProfileCharts = true;
            this.showSetBtn = false;
          } else {
            this.showLoadMore = false;
            this.showMoreLoaderImage = false;
          }
          this.commonService.setFooterDisplayStatus(true);
        });
    }
    else if (this.isShuffles) {
      this.chartService.getChartItems(this.chartId, this.offset, this.maxItem)
        .subscribe(response => {
          if (response && response.items && response.items.length > 0) {
            this.updateData(response, true);
            this.showShufflesCharts = true;
          } else {
            this.showLoadMore = false;
            this.showMoreLoaderImage = false;
          }
          this.commonService.setFooterDisplayStatus(true);
        });
    }
    else if (this.isAzan) {
      this.chartService.getChartItems(this.chartId, this.offset, this.maxItem).subscribe(
        data => {
          if (null != data && null != data.items && null != data.items.length && data.items.length > 0) {
            let chart = data;
            this.seoService.updateChartPageSeoDetails(data);
            this.updateData(chart, true);
            this.showAzanCharts = true;
          }
          else {
            this.showLoadMore = false;
            this.showMoreLoaderImage = false;
          }
          this.commonService.setFooterDisplayStatus(true);
        });
    }
    else {
      this.chartService.getChartItems(this.chartId, this.offset, this.maxItem).subscribe(
        (data) => {
          if (null != data && null != data.items && null != data.items.length && data.items.length > 0) {
            let chart = data;
            this.seoService.updateChartPageSeoDetails(data);
            if (chart.items[0].type == 'ringback' || chart.items[0].type == 'realtone') {
              this.updateData(chart, true);
            } else if (chart.items[0].type == 'chart') {
              this.updateData(chart, true);
              this.showCharts = true;
            }
          }
          else {
            this.showLoadMore = false;
            this.showMoreLoaderImage = false;
          }
          this.commonService.setFooterDisplayStatus(true);
        },
        (error) => {
          this.commonService.setFooterDisplayStatus(true);
        });
    }

  }

  openProfilePopup(chartId, chartItemCount): void {
    this.chartService.getProfileItems(chartId, 0, chartItemCount)
      .subscribe(response => {
        this.profileItems = response.items;
        this.commonService.setSelectedProfileItems(this.profileItems);
        this.commonService.updateCT_SetObject(this.profileItems[0], 'Profiles_Preview');
        this.commonService.initiateLoginOrAction(this.profileItems[0], 'profiles', false, null, false);
      });
  }

  openShufflePopup(shuffleId: string, type: string): void {
    this.contentService.getContentMetadata(shuffleId, type, false)
      .subscribe(response => {
        this.commonService.updateCT_SetObject(response, 'Shuffles_Preview');
        this.commonService.initiateLoginOrAction(response, 'shuffles', false, null, false);
      });
  }

}
