import { Component, HostListener, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { ClevertapService } from '../utils/clevertap.service';
import { CommonService } from '../utils/common.service';
import { CustomTranslateService } from '../utils/custom-translate.service';
import { GTMService } from './../utils/gtm.service';

declare var $: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  @Input() hideBrowsingLanguage: boolean;
  headerLogoUrl: string;
  displayMenu: boolean = false;
  isInitialLoadingCompleted: boolean = false;

  searchString: string;
  showSearchInputBox = false;
  previousUrl: string;
  searchCharLength: number = null;
  isSearchHit = false;
  timeLimitForSearch = 120;
  searchBoxPlaceholder: string;
  searchBoxTitle: string;
  searchBoxReadonly = false;
  searchForm: FormGroup;

  browsingLanguage: string;
  langs: any[];
  langDisplayText: string[] = [];
  browsingLanguageToggle: boolean = false;
  browsingLanguageSelect: boolean = false;
  searchHitSub = new Subject<boolean>();
  userInput: string;


  constructor(private translate: CustomTranslateService, public commonService: CommonService,
    private router: Router, private formBuilder: FormBuilder, private clevertapService: ClevertapService,
    private gtmService: GTMService) {
  }

  ngOnInit() {
    this.browsingLanguage = localStorage.getItem("browsingLanguage");

    this.commonService.getIsInitialLoadingCompleted().subscribe(
      res => {
        this.isInitialLoadingCompleted = res;
      });

    this.commonService.getLatestValueForInitailLoading().subscribe(
      res => {
        this.isInitialLoadingCompleted = res;
      });

    this.searchForm = this.formBuilder.group({
      searchText: ['', [Validators.required]]
    });

    this.commonService.getSearchTextValue()
      .subscribe(resp => {
        this.searchString = resp;
      });

    this.translate.get("pwa.header.logo.image.click.url").subscribe(
      (res: string) => {
        this.headerLogoUrl = res;
        this.searchCharLength = this.translate.instant('pwa.min.search.characters.for.first.backend.hit');
        this.timeLimitForSearch = this.translate.instant('pwa.time.delay.between.search.backend.hits');
        this.searchBoxPlaceholder = this.translate.instant('pwa.search.box.placeholder.text');
        this.searchBoxTitle = this.translate.instant('pwa.search.box.title.text');
        this.browsingLanguageToggle = this.translate.instant('pwa.header.enable.browsing.language.type.toggle').trim() == 'true';
        this.browsingLanguageSelect = this.translate.instant('pwa.header.enable.browsing.language.type.select').trim() == 'true';

        this.langs = this.commonService.getAvailableLanguageDetails();
        if (this.langs != null) {
          //to keep the selected language as the first elememt of the array
          for (let i = 0; i < this.langs.length; i++) {
            if (this.langs[i].includes(this.browsingLanguage)) {
              let lang = this.langs.splice(i, 1).toString();
              this.langs.unshift(lang);
              break;
            }
          }
          //to get the display text for all available languages
          for (let i = 0; i < this.langs.length; i++) {
            let lang = this.langs[i].split(":");
            this.langDisplayText.push(lang[1]);
          }
        }
      }
    );

    this.router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
        if (this.router.url.indexOf("/searchtags") >= 0) {
          this.showSearchInputBox = true;
          this.searchBoxReadonly = false;
        } else if (this.router.url.indexOf("searchmore") >= 0 ||
          this.router.url.indexOf("rtsearchmore") >= 0) {
          this.showSearchInputBox = true;
          this.searchBoxReadonly = true;
        } else if (this.router.url.indexOf("search") >= 0) {
          this.showSearchInputBox = true;
          this.searchBoxReadonly = false;
        } else if (this.router.url.indexOf("trending") >= 0) {
          this.showSearchInputBox = true;
          this.searchBoxReadonly = false;
        } else {
          this.showSearchInputBox = false;
          this.searchBoxReadonly = false;
        }
      }
    });

    this.getSearchHitStatus().subscribe((res: boolean) => {
      if (!res && null != this.userInput) {
        this.initiateSearch(this.userInput);
      }
    });
  }

  updateBrowsingLanguageForButton(): string {
    let browsingLanguageDetails;
    if (this.langs != null) {
      browsingLanguageDetails = this.langs[1].toString();
      this.browsingLanguage = browsingLanguageDetails.split(":")[0];
    }
    return browsingLanguageDetails;
  }

  updateBrowsingLanguageForDropdown(language: string): string {
    let browsingLanguageDetails;
    if (this.langs != null && this.langDisplayText != null) {
      for (let i = 0; i < this.langDisplayText.length; i++) {
        if (this.langDisplayText[i] == language) {
          browsingLanguageDetails = this.langs[i].toString();
          this.browsingLanguage = browsingLanguageDetails.split(":")[0];
          break;
        }
      }
    }
    return browsingLanguageDetails;
  }

  updateBrowsingLanguage(language: string): void {
    let browsingLanguageDetails;
    if (language != this.langDisplayText[0]) {
      if (this.browsingLanguageToggle) {
        browsingLanguageDetails = this.updateBrowsingLanguageForButton();
      } else if (this.browsingLanguageSelect) {
        browsingLanguageDetails = this.updateBrowsingLanguageForDropdown(language);
      }

      localStorage.setItem("browsingLanguage", this.browsingLanguage);
      //to update the CSS for the selected language
      if (browsingLanguageDetails.includes("rtl")) {
        this.commonService.checkAndUpdateStyleSheetValue('css/style_ar.min.css');
      } else {
        this.commonService.checkAndUpdateStyleSheetValue('css/style.min.css');
      }

      let userProfileForClevertap = {};
      userProfileForClevertap["app_language"] = this.browsingLanguage;
      this.clevertapService.updateClevertapUserProfile(userProfileForClevertap, false, null);
      
      let link = location.origin + location.pathname;
      location.replace(link);
    }
  }

  showSearchBox() {
    this.showSearchInputBox = true;
    this.searchForm.reset();
    this.redirectToSearchTagsPage();
  }

  redirectToSearchTagsPage() {
    this.previousUrl = this.router.url;
    this.router.navigateByUrl('/searchtags');
  }

  hideSearchBox() {
    this.showSearchInputBox = false;
    sessionStorage.removeItem('USER_SELECTED_CONTENT');
    this.searchString = '';
    if (this.previousUrl != null) {
      this.router.navigateByUrl(this.previousUrl);
    } else {
      this.router.navigateByUrl('/home');
    }
  }

  onKeyUp(event: any) {
    this.userInput = event.target.value;
    let oldInput = this.searchString;
    if (null != this.userInput && this.userInput.length >= this.searchCharLength && !this.isSearchHit &&
      (null == oldInput || oldInput != this.userInput)) {
      this.initiateSearch(this.userInput);
    }
  }

  initiateSearch(userInput): void {
    if (this.searchString != userInput && userInput.length > 0) {
      this.searchString = userInput;
      this.goToSearchResultsMainPage();
    }
  }

  initiateSearchFromForm(formValue: any): void {
    this.userInput = formValue.value.searchText;
    let oldInput = this.searchString;

    if (null != this.userInput && this.userInput.length >= this.searchCharLength && !this.isSearchHit &&
      (null == oldInput || oldInput != this.userInput)) {
      this.initiateSearch(this.userInput);
    }
  }

  goToSearchResultsMainPage(): void {
    this.showSearchInputBox = true;
    this.setSearchHitStatus(true);
    this.router.navigateByUrl('/search/' + this.searchString);
    setTimeout(() => {
      this.setSearchHitStatus(false);
    }, this.timeLimitForSearch);
  }

  updateDisplayMenuValue(value: boolean) {
    this.displayMenu = value;
  }


  updateMenuDisplay(): void {
    this.displayMenu = !this.displayMenu;
    if (this.displayMenu) {
      let ctEventObj = {};
      ctEventObj['Click_status'] = true;
      this.commonService.stopBackgroundScroll();
      this.clevertapService.updateClevertapEvent("Menu click", false, null, ctEventObj);
      let gtmEventObj = {};
      gtmEventObj['event'] = 'Menu click';
      gtmEventObj['Click_status'] = true;
      this.gtmService.pushGTMEvent(gtmEventObj, false, 'GTM Menu click');
    }
    else {
      this.commonService.startBackgroundScroll();
    }

    $('#new_overlay_menu').toggle();
    $('.navigation').toggleClass('visible');
  }

  setSearchHitStatus(status: boolean) {
    this.searchHitSub.next(status);
  }

  getSearchHitStatus(): Observable<boolean> {
    return this.searchHitSub.asObservable();
  }

  @HostListener('window:popstate', ['$event'])
  closeMenu(event) {
    if (this.displayMenu) {
      $('#new_overlay_menu').toggle();
      $('.navigation').toggleClass('visible');
      this.commonService.startBackgroundScroll();
    }
  }
}


