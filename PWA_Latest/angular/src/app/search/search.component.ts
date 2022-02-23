import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { DeviceDetectorService } from 'ngx-device-detector';
import { SearchTagsService } from "../search-tags/search-tags.service";
import { ClevertapService } from '../utils/clevertap.service';
import { CustomTranslateService } from '../utils/custom-translate.service';
import { CommonService } from './../utils/common.service';
import { GTMService } from './../utils/gtm.service';
import { SearchService } from "./search.service";

@Component({
  templateUrl: './search.component.html'
})

export class SearchComponent implements OnInit {

  searchText: string;
  searchResults: SearchResultItem[] = [];
  ctSearchResults: SearchResultItem[] = [];
  rtSearchResults: SearchResultItem[] = [];
  ctSearchResultsMap: Map<string, SearchResultItem> = new Map<string, SearchResultItem>();
  rtSearchResultsMap: Map<string, SearchResultItem> = new Map<string, SearchResultItem>();

  searchTagsResult: any;
  searchTags: TagItem[] = [];
  isEmptyResult: boolean = false;
  emptySearchDescription: string;
  searchTagsHeading: string;
  selectedContent: string = 'ct';
  showRTToggle: boolean = false;
  isRTContent: boolean = false;
  searchHitAfterToggle: boolean = false;
  searchImageDefault: string;
  searchImageLoading: string;
  showSetBtn = false;
  showGetBtn = false;

  contentLangValuesIds: string;

  trackNameSize: number;
  artistAlbumdisplayType: string;
  artistAlbumSize: number;
  searchResultSub: any;

  constructor(private searchService: SearchService,
    private route: ActivatedRoute, private router: Router,
    public commonService: CommonService,
    private translate: CustomTranslateService,
    private searchTagsService: SearchTagsService,
    private clevertapService: ClevertapService,
    private gtmService: GTMService,
    private deviceService: DeviceDetectorService) { }

  ngOnInit(): void {

    if (sessionStorage.getItem('USER_SELECTED_CONTENT')) {
      this.selectedContent = sessionStorage.getItem('USER_SELECTED_CONTENT');
    }
    this.isRTContent = (this.selectedContent == 'rt');

    this.commonService.getIsHeaderChecked().subscribe(result => {
      if (result) {
        let isReloadRequired: boolean = this.commonService.checkIfReloadRequired();
        if (isReloadRequired) {
          location.reload();
        }
        else {
          this.getSearchImages();
          this.getSearchComponentDetails();
        }
      }
    });

    this.searchService.getRTToggleSelection()
      .subscribe(resp => {
        if (resp != this.selectedContent) {
          this.selectedContent = resp;
          this.isRTContent = (this.selectedContent == 'rt');
          if (this.searchHitAfterToggle) {
            if (this.selectedContent == 'ct') {
              this.searchResults = [...this.ctSearchResults];
            } else if (this.selectedContent == 'rt') {
              this.searchResults = [...this.rtSearchResults];
            }
          } else {
            this.getSearchResultsData();
            this.searchHitAfterToggle = true;
          }
        }
      });
  }

  private getSearchComponentDetails(): void {
    this.route.params.subscribe(params => {
      this.updateDefaultValues();
      this.searchText = params["searchText"];
      this.searchText = this.commonService.getSafeValue(this.searchText);
      this.commonService.setSearchTextValue(this.searchText);
      this.getSearchResultsData();
    });
  }

  private getSearchResultsData(): void {
    if (this.searchResultSub) {
      this.searchResultSub.unsubscribe();
    }
    this.emptySearchDescription = this.translate.instant('pwa.no.search.result.found.message',
      { searchString: this.searchText });
    this.contentLangValuesIds = this.commonService.getContentLanguageIdsSelected();

    this.trackNameSize = this.translate.instant('pwa.track.name.length.limit');
    this.artistAlbumdisplayType = this.translate.instant('pwa.ringback.artistoralbum.display');
    this.artistAlbumSize = this.translate.instant('pwa.ringback.artistoralbum.length.limit');


    if (null != this.contentLangValuesIds && this.contentLangValuesIds.length != 0) {
      this.searchResultSub = this.searchService.getCategorisedSearchResults(this.searchText, "all", 0, null, this.contentLangValuesIds, this.isRTContent)
        .subscribe(searchResp => {
          this.searchHitAfterToggle = false;
          this.updateDefaultValues();
          this.searchTagsResult = this.commonService.getSearchTagsValue();
          this.searchTagsHeading = this.translate.instant('pwa.trending.searches.heading');
          this.updateSearchTags(searchResp);
        },
          error => {
            // console.log('error while getting search results: ' + error)
            let searchCTObj = {};
            searchCTObj['Keyword_typed'] = 'Yes';
            searchCTObj['Keyword'] = this.searchText;
            searchCTObj['Result_shown'] = 'No';
            this.clevertapService.updateClevertapEvent("Search", false, null, searchCTObj);
            let gtmEventObj = JSON.parse(JSON.stringify(searchCTObj));
            if (null != gtmEventObj) {
              gtmEventObj['event'] = 'Search';
              this.gtmService.pushGTMEvent(gtmEventObj, false, 'GTM_Search');
            }
          });
    }

  }

  private getSearchImages(): void {
    this.translate.get("pwa.searchresults.img.default").subscribe(
      res => {
        this.searchImageDefault = res;
        this.searchImageLoading = this.translate.instant("pwa.searchresults.img.loading");
        this.showSetBtn = this.translate.instant('pwa.show.direct.set.button').trim() == 'true';
        this.showGetBtn = this.translate.instant('pwa.show.direct.get.button').trim() == 'true';

        let rtToggle = this.translate.instant("pwa.search.results.enable.rt.toggle").trim() == 'true';
        let rtToggleForDesktop = this.translate.instant("pwa.disable.rt.for.desktop").trim() == 'true';
        if (rtToggle) {
          if ((this.deviceService.isMobile() && this.deviceService.os == 'Android') || (this.deviceService.isTablet() && this.deviceService.os == 'Android')
            || (this.deviceService.isDesktop() && !rtToggleForDesktop && this.deviceService.os != 'Mac')) {
            this.showRTToggle = true;
          }
        }
      });
  }

  private updateDefaultValues(): void {
    this.searchTags = [];
    this.searchResults = [];
    this.ctSearchResults = [];
    this.rtSearchResults = [];
    this.ctSearchResultsMap = new Map<string, SearchResultItem>();
    this.rtSearchResultsMap = new Map<string, SearchResultItem>();
    this.isEmptyResult = false;
  }

  private updateSearchResults(searchResp: any) {
    let searchCTObj = {};
    searchCTObj['Keyword_typed'] = 'Yes';
    searchCTObj['Keyword'] = this.searchText;
    searchCTObj['isRTContent'] = this.isRTContent;


    if (searchResp) {
      let allSearchResults = searchResp;
      let songMax: number = Number(this.translate.instant('pwa.max.tunes.search.results'));
      let albumMax: number = Number(this.translate.instant('pwa.max.album.search.results'));
      let artistMax: number = Number(this.translate.instant('pwa.max.artist.search.results'));
      let trendingMax: number = Number(this.translate.instant('pwa.max.trending.search.results'));

      this.updateSearchResultItem(this.searchTags, "pwa.trending.search.result.heading",
        trendingMax, "trending");
      this.updateSearchResultItem(allSearchResults.artist, "pwa.artist.search.result.heading",
        artistMax, "artist");
      this.updateSearchResultItem(allSearchResults.album, "pwa.album.search.result.heading",
        albumMax, "album");
      this.updateSearchResultItem(allSearchResults.song, "pwa.tunes.search.result.heading",
        songMax, "song");

      if (this.ctSearchResultsMap != null && this.selectedContent == 'ct') {
        this.updateMap(this.ctSearchResultsMap, this.ctSearchResults);
      } else if (this.rtSearchResultsMap != null && this.selectedContent == 'rt') {
        this.updateMap(this.rtSearchResultsMap, this.rtSearchResults);
      }
      this.updateEmptySearchDetails(searchCTObj);
    }
    else {
      this.updateEmptySearchDetails(searchCTObj);
    }
    this.clevertapService.updateClevertapEvent("Search", false, null, searchCTObj);
    let gtmEventObj = JSON.parse(JSON.stringify(searchCTObj));
    if (null != gtmEventObj) {
      gtmEventObj['event'] = 'Search';
      this.gtmService.pushGTMEvent(gtmEventObj, false, 'GTM_Search');
    }
  }


  private updateMap(searchMap, searchResults): void {

    if (searchMap.has("trending")) {
      searchResults.push(searchMap.get("trending"))
    }
    if (searchMap.has("song")) {
      searchResults.push(searchMap.get("song"))
    }
    if (searchMap.has("album")) {
      searchResults.push(searchMap.get("album"))
    }
    if (searchMap.has("artist")) {
      searchResults.push(searchMap.get("artist"))
    }
    this.searchResults = [...searchResults];

  }
  private updateEmptySearchDetails(searchCTObj): void {
    if (this.ctSearchResults.length <= 0 && !this.isRTContent) {
      searchCTObj['Result_shown'] = 'No';
      this.isEmptyResult = true;
    } else if (this.rtSearchResults.length <= 0 && this.isRTContent) {
      searchCTObj['Result_shown'] = 'No';
      this.isEmptyResult = true;
    } else {
      searchCTObj['Result_shown'] = 'Yes';
    }
  }

  private updateSearchTags(searchResp: any) {

    if (this.searchTagsResult == null) {
      this.searchTagsResult = [];
      this.searchTagsService.getTrendingSearchTags(this.contentLangValuesIds)
        .subscribe(response => {
          let searchTagsResponse = response.tags;
          if (searchTagsResponse && searchTagsResponse.length > 0) {
            this.getUpdatedSearchTagItem(searchTagsResponse);
          }
          this.commonService.setSearchTagsValue(this.searchTagsResult);
          this.updateSearchTagItem(searchResp);
        },
          error => {
          });
    }
    else {
      this.updateSearchTagItem(searchResp);
    }
  }

  private getUpdatedSearchTagItem(searchTagResp: any) {
    if (null != searchTagResp) {
      for (let tag of searchTagResp) {
        let tagItem = { tagName: null, chartId: null };
        if (tag.tagType == "PLAYLIST") {
          tagItem = { tagName: tag.tagName, chartId: tag.chartId };
          this.searchTagsResult.push(tagItem);
        }
      }
    }
  }

  private updateSearchTagItem(searchResp: any) {
    if (null != this.searchTagsResult) {
      for (let tag of this.searchTagsResult) {
        let tagName: string = tag.tagName;
        if (tagName.toLowerCase().startsWith(this.searchText.toLowerCase())) {
          this.searchTags.push(tag);
        }
      }
    }
    this.updateSearchResults(searchResp);
  }

  private updateSearchResultItem(searchResultResponse: any, headingText: string, maxItem: number, genre: string): void {
    let searchItem: SearchResultItem = { headingText: null, resultItems: null, maxItem: 0, genre: null, url: null };

    if (searchResultResponse &&
      ((searchResultResponse.items && searchResultResponse.items.length > 0) ||
        (genre == "trending" && searchResultResponse.length > 0))) {
      searchItem.headingText = headingText;
      searchItem.resultItems = searchResultResponse;
      searchItem.maxItem = maxItem;
      searchItem.genre = genre;
      if (genre != "trending") {
        searchItem.url = "/search/" + genre + "/" + this.searchText;
      }
      else {
        searchItem.resultItems.items = this.updateImageForTrending(searchResultResponse);
      }

      if (this.selectedContent == 'ct') {
        this.ctSearchResultsMap.set(genre, searchItem);
      } else if (this.selectedContent == 'rt') {
        this.rtSearchResultsMap.set(genre, searchItem);
      }
    }
  }

  private updateImageForTrending(items: any): any {

    for (let i = 0; i < items.length; i++) {
      items[i].primary_image = "image/trending_search_default.jpg";
    }
    return items;
  }

  redirectToCategoryURL(chartId: string): void {
    this.router.navigateByUrl("/more/trending/" + chartId);
  }

  getMoreButtonLink(genre: string) {
    let searchMoreUrl = "searchmore";
    if (this.isRTContent) {
      searchMoreUrl = "rtsearchmore";
    }
    if (genre == 'artist') {
      this.router.navigateByUrl("/" + searchMoreUrl + "/artist/" + this.searchText);
    } else if (genre == 'album') {
      this.router.navigateByUrl("/" + searchMoreUrl + "/album/" + this.searchText);
    } else if (genre == 'song') {
      this.router.navigateByUrl("/" + searchMoreUrl + "/song/" + this.searchText);
    }
  }
}

export class SearchResultItem {
  headingText: string;
  resultItems: any;
  maxItem: number;
  genre: string;
  url: string;
}
export class TagItem {
  tagName: string;
  chartId: string;
}
