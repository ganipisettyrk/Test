import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { CommonService } from '../utils/common.service';
import { CustomTranslateService } from '../utils/custom-translate.service';
import { SearchTagsService } from './search-tags.service';
import { ClevertapService } from '../utils/clevertap.service';
import { GTMService } from '../utils/gtm.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { SearchService } from 'src/app/search/search.service';

@Component({
    templateUrl: './search-tags.component.html'
})

export class SearchTagsComponent implements OnInit {

    searchTags: TagItem[] = [];
    searchTagsHeading: string;
    showRTToggle = false;
    selectedContent = 'ct';

    constructor(private searchTagsService: SearchTagsService,
        private translate: CustomTranslateService,
        private commonService: CommonService,
        private router: Router,
        private clevertapService: ClevertapService,
        private gtmService: GTMService,
        private deviceService: DeviceDetectorService,
        private searchService: SearchService) { }

    ngOnInit() {
        this.searchService.getRTToggleSelection()
            .subscribe(resp => {
                this.selectedContent = resp;
            });

        this.commonService.getIsHeaderChecked().subscribe(result => {
            if (result) {
                this.getSearchTagComponentDetails();
            }
        });

    }

    private getSearchTagComponentDetails(): void {
        this.translate.get('pwa.trending.searches.heading').subscribe(
            (response: string) => {
                let rtToggle = this.translate.instant("pwa.search.tags.enable.rt.toggle").trim() == 'true';
                let rtToggleForDesktop = this.translate.instant("pwa.disable.rt.for.desktop").trim() == 'true';
                if (rtToggle) {
                    if ((this.deviceService.isMobile() && this.deviceService.os == 'Android') || (this.deviceService.isTablet() && this.deviceService.os == 'Android')
                        || (this.deviceService.isDesktop() && !rtToggleForDesktop && this.deviceService.os != 'Mac')) {
                        this.showRTToggle = true;
                    }
                }
                this.searchTagsHeading = response;
                let browsingLang: string = localStorage.getItem("browsingLanguage");
                if (null != browsingLang && browsingLang.length != 0) {
                    this.showTrendingSearchTags(browsingLang);
                }
            });
    }

    showTrendingSearchTags(browsingLang: string): void {
        this.searchTagsService.getTrendingSearchTags(browsingLang)
            .subscribe(
                response => {
                    let searchTagsResponse = response.tags;
                    if (searchTagsResponse && searchTagsResponse.length > 0) {
                        this.getUpdatedSearchTagItem(searchTagsResponse);
                    }
                    if (this.searchTags && this.searchTags.length > 0) {
                        this.commonService.setSearchTagsValue(this.searchTags);
                    }
                },
                error => {
                    // console.log('error while getting searchtags...' + error);
                });
    }

    redirectToCategoryURL(chartId: string, tagName: string): void {
        let searchCTObj = {};
        searchCTObj['Keyword_typed'] = 'No';
        searchCTObj['Clicked_Tag_name'] = tagName;
        this.clevertapService.updateClevertapEvent("Search", false, null, searchCTObj);
        let gtmEventObj = JSON.parse(JSON.stringify(searchCTObj));
        if (null != gtmEventObj) {
            gtmEventObj['event'] = 'Search';
            this.gtmService.pushGTMEvent(gtmEventObj, false, 'GTM_Search');
        }
        this.router.navigateByUrl("/more/trending/" + chartId);
    }

    private getUpdatedSearchTagItem(searchTagResp: any) {
        if (null != searchTagResp) {
            for (let tag of searchTagResp) {
                let tagItem = { tagName: null, chartId: null };
                if (tag.tagType == "PLAYLIST") {
                    tagItem = { tagName: tag.tagName, chartId: tag.chartId };
                    this.searchTags.push(tagItem);
                }
            }
        }
    }

}

export class TagItem {
    tagName: string;
    chartId: string;
}