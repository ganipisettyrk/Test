import { Component, HostListener, Input, NgModule, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PopupDataItem, PopupService } from '../popup/popup.service';
import { ClevertapService } from '../utils/clevertap.service';
import { CommonService } from '../utils/common.service';
import { CustomTranslateService } from '../utils/custom-translate.service';
import { SharedModule } from '../utils/shared.module';
import { GTMService } from './../utils/gtm.service';
import { NametuneService } from './nametune.service';

@Component({
  selector: 'app-nametune',
  templateUrl: './nametune.component.html',
  styleUrls: ['./nametune.component.css'],
  providers: [NametuneService]
})
export class NametuneComponent implements OnInit {

  @Input() heading: string;
  @Input() subHeading: string;

  placeholderText: string;
  nameTuneForm: FormGroup;
  searchCharLength: number = null;
  nameTuneSearchString: string = null;
  maxItem: number = 0;

  isTypeEnabled: boolean = false;
  tuneType: string[] = [];
  tuneDisplayText: string[] = [];

  constructor(private translate: CustomTranslateService, private popupService: PopupService,
    private formBuilder: FormBuilder, private commonService: CommonService,
    private nametuneService: NametuneService, private clevertapService: ClevertapService,
    private gtmService: GTMService) { }

  ngOnInit() {

    this.nameTuneForm = this.formBuilder.group({
      nameTuneSearchText: ['', [Validators.required]]
    });

    this.searchCharLength = this.translate.instant('pwa.nametunes.min.search.characters.for.backend.hit');
    this.maxItem = this.translate.instant('pwa.nametunes.max.search.results');
    this.isTypeEnabled = this.translate.instant('pwa.nametunes.enable.type') == "true";
    let tuneTypeArr = this.translate.instant('pwa.nametunes.type').split(",");
    if (this.isTypeEnabled) {
      for (let i = 0; i < tuneTypeArr.length; i++) {
        let nametuneType = tuneTypeArr[i].split(":");
        this.tuneType.push(nametuneType[0]);
        this.tuneDisplayText.push(nametuneType[1]);
      }
      this.nametuneService.type = this.tuneType[0];
      this.placeholderText = this.translate.instant('pwa.' + this.nametuneService.type + 's.search.box.placeholder.text');
    } else {
      this.nametuneService.type = "nametune";
      this.placeholderText = this.translate.instant('pwa.nametunes.search.box.placeholder.text');
    }
  }

  initiateNametuneSearch(formValue: any): void {
    let userInput = formValue.value.nameTuneSearchText;
    if (null != userInput && userInput.length >= Number(this.searchCharLength)) {
      let oldInput = this.nameTuneSearchString;
      if (null == oldInput || oldInput != userInput) {
        userInput = this.commonService.getSafeValue(userInput);
        this.nameTuneSearchString = userInput;
        this.goToSearchResultsPopup(this.nameTuneSearchString);
      }
    }
  }


  private goToSearchResultsPopup(nameTune: string): void {
    this.nametuneService.getNameTuneItems(nameTune, 0, this.maxItem)
      .subscribe(res => {
        let dataItem: any = { result: res, nameTune: nameTune, maxItem: this.maxItem };
        let heading = this.translate.instant("pwa.popup." + this.nametuneService.type + "s.heading.text");
        let popupItem: PopupDataItem = {
          isLoggedIn: null,
          type: "nametunesearch",
          popupData: dataItem,
          heading: heading,
          response: null,
          showCloseButton: true,
          historyIndex: "",
          pageName: "",
          isSetForNone: false
        };

        this.nameTuneSearchString = null;
        this.popupService.showPopup(popupItem);
      },
        error => {
          let nametuneSearchCTEventObj = {};
          nametuneSearchCTEventObj['Keyword_searched'] = nameTune;
          nametuneSearchCTEventObj['Result_shown'] = 'no';
          nametuneSearchCTEventObj['Type'] = this.nametuneService.type;
          this.clevertapService.updateClevertapEvent("Name tune search", false, null, nametuneSearchCTEventObj);
          let gtmEventObj = JSON.parse(JSON.stringify(nametuneSearchCTEventObj));
          if (null != gtmEventObj) {
            gtmEventObj['event'] = 'Name tune search';
            this.gtmService.pushGTMEvent(gtmEventObj, false, 'GTM Name tune search');
          }
        });

  }

  onTypeChange(value) {
    this.nametuneService.type = value;
    this.placeholderText = this.translate.instant('pwa.' + value + 's.search.box.placeholder.text');
  }

  @HostListener('click')
  stopMusic() {
    this.commonService.stopPlayerIfApplicable();
  }

}

@NgModule({
  imports: [SharedModule],
  declarations: [NametuneComponent]
})
class NametuneModule {

}