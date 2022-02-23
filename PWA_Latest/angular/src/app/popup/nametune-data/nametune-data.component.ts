import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NametuneService } from 'src/app/nametune/nametune.service';
import { ClevertapService } from 'src/app/utils/clevertap.service';
import { CommonService } from 'src/app/utils/common.service';
import { CustomTranslateService } from 'src/app/utils/custom-translate.service';
import { PopupDataItem, PopupService } from '../popup.service';
import { GTMService } from './../../utils/gtm.service';

@Component({
  selector: 'app-nametune-data',
  templateUrl: './nametune-data.component.html',
  styleUrls: ['./nametune-data.component.css'],
  providers: [NametuneService]
})

export class NametuneDataComponent implements OnInit {

  @Input() data: any;
  @Input() showCreateNameTuneScreen: boolean;

  resultItems: any;
  nameTune: string;
  maxItem: number

  createTuneDescription: string;
  confirmationHeadingText: string;
  confirmationDescriptionText: string;

  createResultHeadingText: string
  createResultDescriptionText: string;

  offset: number = 0;
  totalItemCount: number = 0;
  showLoadMore: boolean = false;
  showMoreLoaderImage: boolean = false;

  nameTuneFormPopup: FormGroup;
  searchCharLength: number = null;

  showCreateConfirmScreen: boolean = false;
  showCreateResponseScreen: boolean = false;

  placeholderTxt: string;
  resultHeadingTxt: string;
  subheadingTxt: string;

  @Output() valueUpdate = new EventEmitter<boolean>();

  constructor(private translate: CustomTranslateService, public commonService: CommonService,
    private formBuilder: FormBuilder, private nametuneService: NametuneService,
    private popupService: PopupService, private clevertapService: ClevertapService,
    private gtmService: GTMService) { }

  ngOnInit() {
    this.nameTuneFormPopup = this.formBuilder.group({
      nameTuneSearchTextPopup: ['', [Validators.required]]
    });

    this.searchCharLength = this.translate.instant('pwa.nametunes.min.search.characters.for.backend.hit');
    this.subheadingTxt = this.translate.instant('pwa.home.' + this.nametuneService.type + 's.subheading');
    this.placeholderTxt = this.translate.instant('pwa.' + this.nametuneService.type + 's.search.box.placeholder.text');
    this.resultHeadingTxt = this.translate.instant('pwa.popup.' + this.nametuneService.type + 's.result.heading');

    if (null != this.data) {
      this.updateResultData(this.data.result);
      let nametuneValue = this.commonService.getSafeValue(this.data.nameTune);
      this.nameTune = nametuneValue;
      this.maxItem = this.data.maxItem;
      this.createTuneDescription = this.translate.instant("pwa.popup.nametunes.create.new.nametune.description", { searchString: this.nameTune });
    }
  }

  initiateNametuneSearchInPopUp(formValue: any): void {
    let userInput = formValue.value.nameTuneSearchTextPopup;

    if (null != userInput && userInput.length >= Number(this.searchCharLength)) {
      let oldInput = this.nameTune;
      if (null == oldInput || oldInput != userInput) {
        this.updateDefaultValues();
        userInput = this.commonService.getSafeValue(userInput);
        this.nameTune = userInput;
        this.getSearchResults(this.nameTune);
      }
    }
  }

  loadMore(): void {
    if (this.offset >= this.totalItemCount) {
      this.showLoadMore = false;
    } else {
      this.showLoadMore = false;
      this.showMoreLoaderImage = true;
      this.getNameTunes();
    }
  }

  clearValues(): void {
    this.updateDefaultValues();
    this.nameTune = null;;
  }

  goToCreateScreen(): void {
    this.commonService.isUserLoggedIn().subscribe(
      (isLoggedIn: boolean) => {
        if (isLoggedIn) {
          this.showCreateNameTuneScreen = true;
        }
        else {
          let popUpItemExisting: PopupDataItem = this.popupService.getPopUpDataItem();

          let newpopUpItem: PopupDataItem = {
            isLoggedIn: false,
            type: "nametuneCreate",
            popupData: popUpItemExisting.popupData,
            heading: popUpItemExisting.heading,
            response: null,
            showCloseButton: true,
            historyIndex: null,
            pageName: null,
            isSetForNone: false
          };
          this.popupService.updatePopUpDataItem(newpopUpItem);
          this.valueUpdate.emit(true);
        }
      });
  }

  goToCreateConfirmtionScreen(): void {
    this.confirmationHeadingText = this.translate.instant("pwa.popup." + this.nametuneService.type + "s.confirmation.heading.text");
    this.confirmationDescriptionText = this.translate.instant("pwa.popup." + this.nametuneService.type + "s.confirmation.description.text",
      { searchString: this.nameTune });
    this.showCreateConfirmScreen = true;
  }

  closePopup(): void {
    this.popupService.closePopup();
  }

  createNameTune(): void {
    this.nametuneService.createNameTune(this.nameTune).subscribe(
      res => {
        if (null != res && res.result == 'success') {
          this.goToThankYouScreen();
        }
        else {
          this.goToErrorScreen();
        }
      },
      error => {
        this.goToErrorScreen();
      }
    )
  }

  private goToThankYouScreen(): void {
    this.createResultHeadingText = this.translate.instant("pwa.popup." + this.nametuneService.type + "s.create.success.heading.text");
    this.createResultDescriptionText = this.translate.instant("pwa.popup." + this.nametuneService.type + "s.create.success.description.text",
      { searchString: this.nameTune });
    this.showCreateResponseScreen = true;
  }

  private goToErrorScreen(): void {
    this.createResultHeadingText = this.translate.instant("pwa.popup." + this.nametuneService.type + "s.create.error.heading.text");
    this.createResultDescriptionText = this.translate.instant("pwa.popup." + this.nametuneService.type + "s.create.error.description.text",
      { searchString: this.nameTune });
    this.showCreateResponseScreen = true;
  }

  initiatePurchase(item: any): void {

    let popUpItemExisting: PopupDataItem = this.popupService.getPopUpDataItem();
    this.commonService.updateCT_SetObject(item, 'Nametune-Preview');
    this.clevertapService.updateClevertapEvent("SET_Click", false, 'SET_CLICK_CT_EVENT_DATA', null);

    let gtmEventObj = JSON.parse(sessionStorage.getItem('SET_CLICK_CT_EVENT_DATA'));
    if (null != gtmEventObj) {
      gtmEventObj['event'] = 'SET_Click';
      this.gtmService.pushGTMEvent(gtmEventObj, false, 'GTM_SET_Click');
    }

    let newpopUpItem: PopupDataItem = {
      isLoggedIn: false,
      type: "purchase",
      popupData: item,
      heading: popUpItemExisting.heading,
      response: null,
      showCloseButton: true,
      historyIndex: null,
      pageName: null,
      isSetForNone: false
    };
    this.commonService.isUserLoggedIn().subscribe(
      (isLoggedIn: boolean) => {
        if (isLoggedIn) {
          newpopUpItem.isLoggedIn = true;
        }
        this.popupService.updatePopUpDataItem(newpopUpItem);
        this.valueUpdate.emit(true);
      });
  }

  private updateDefaultValues(): void {
    this.offset = 0;
    this.totalItemCount = 0;
    this.showLoadMore = false;
    this.showMoreLoaderImage = false;
    this.resultItems = null;
  }

  private getSearchResults(nameTune: string): void {

    this.nametuneService.getNameTuneItems(nameTune, 0, this.maxItem).subscribe(
      res => {
        this.updateResultData(res);
      });
  }

  private updateShowLoadMore(): void {
    if (this.offset >= this.totalItemCount) {
      this.showLoadMore = false;
    } else {
      this.showLoadMore = true;
    }
  }

  private updateResultData(res: any) {
    let nametuneSearchCTEventObj = {};
    nametuneSearchCTEventObj['Keyword_searched'] = this.nameTune;
    nametuneSearchCTEventObj['Type'] = this.nametuneService.type;
    if (null != res && null != res.items && null != res.items.length && res.items.length > 0) {
      this.totalItemCount = res.total_item_count;
      this.offset += res.item_count;

      if (null != this.resultItems) {
        this.resultItems = this.resultItems.concat(res.items);
      } else {
        this.resultItems = res.items;
      }
      this.showMoreLoaderImage = false;
      this.updateShowLoadMore();
      nametuneSearchCTEventObj['Result_shown'] = 'yes';
      this.createTuneDescription = this.translate.instant("pwa.popup.nametunes.create.new.nametune.description", { searchString: this.nameTune });
    }
    else {
      nametuneSearchCTEventObj['Result_shown'] = 'no';
      this.showLoadMore = false;
      this.showMoreLoaderImage = false;
      this.createTuneDescription = this.translate.instant("pwa.popup.nametunes.create.new.nametune.description", { searchString: this.nameTune });
    }
    this.clevertapService.updateClevertapEvent("Name tune search", false, null, nametuneSearchCTEventObj);
    let gtmEventObj = JSON.parse(JSON.stringify(nametuneSearchCTEventObj));
    if (null != gtmEventObj) {
      gtmEventObj['event'] = 'Name tune search';
      this.gtmService.pushGTMEvent(gtmEventObj, false, 'GTM Name tune search');
    }
  }

  private getNameTunes(): void {

    this.nametuneService.getNameTuneItems(this.nameTune, this.offset, this.maxItem).subscribe(
      (data) => {
        this.updateResultData(data);
      },
      (error) => {

      });
  }

  goToStoreUrl(): void {
    let url = this.translate.instant("pwa.popup.nametunes.gotostore.button.click.url");
    if (null != url) {
      this.closePopup();
      this.commonService.goToURL(url);
    }
  }
}

