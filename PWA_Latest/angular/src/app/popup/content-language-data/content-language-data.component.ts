import { Component, Input, OnInit } from '@angular/core';
import { CommonService } from 'src/app/utils/common.service';
import { PopupService } from '../popup.service';
import { ClevertapService } from 'src/app/utils/clevertap.service';

@Component({
  selector: 'app-content-language-data',
  templateUrl: './content-language-data.component.html',
  styleUrls: ['./content-language-data.component.css']
})
export class ContentLanguageDataComponent implements OnInit {

  @Input() data: any;

  langData: any = new Map();

  selectedLanguages: string[] = [];
  selectedLanguagesIds: string[] = [];

  constructor(private commonService: CommonService, private popupService: PopupService, private clevertapService: ClevertapService) { }

  ngOnInit() {

    if (null != this.data) {

      let defaultLanguages: string[] = [];
      let contentLanguages: string[] = [];
      this.selectedLanguages = [];
      this.selectedLanguagesIds = [];

      let contentLangValues: string = localStorage.getItem("contentLanguage");
      if (null != contentLangValues) {
        contentLanguages = contentLangValues.split(",");
      } else {
        defaultLanguages = [...this.commonService.getDefaultLanguage()];
      }

      if (null != contentLanguages && contentLanguages.length > 0) {
        this.selectedLanguages = [...contentLanguages];
        let contentLangValuesIds: string = localStorage.getItem("contentLanguageId");
        this.selectedLanguagesIds = contentLangValuesIds.split(",");
      } else if (null != defaultLanguages && defaultLanguages.length > 0) {
        this.selectedLanguages = [...defaultLanguages];
        this.selectedLanguagesIds = [...this.commonService.getDefaultLanguageIds()];
      }

      for (let val of this.data) {
        let contentLang: contentLanguageItem = {
          displayText: val.displayText,
          languageId: val.languageId,
          selected: false
        };
        for (let value of this.selectedLanguages) {
          if (value == contentLang.displayText) {
            contentLang.selected = true;
          }
        }
        this.langData.set(val.languageId, contentLang);
      }

    }

  }

  updateLanguageItem(contentLang: contentLanguageItem): void {
    let value: contentLanguageItem = this.langData.get(contentLang.languageId);
    value.selected = !contentLang.selected;
    if (value.selected) {
      this.selectedLanguages.push(contentLang.displayText);
      this.selectedLanguagesIds.push(contentLang.languageId);
    } else {
      let index = this.selectedLanguages.indexOf(contentLang.displayText);
      this.selectedLanguages.splice(index, 1);
      let indexId = this.selectedLanguagesIds.indexOf(contentLang.languageId);
      this.selectedLanguagesIds.splice(indexId, 1);
    }
  }

  updateSelectedContentLanguage(): void {
    let contentLangValues: string = this.selectedLanguages.toString();
    let contentLangValuesIds: string = this.selectedLanguagesIds.toString();
    localStorage.setItem("contentLanguage", contentLangValues);
    localStorage.setItem("contentLanguageId", contentLangValuesIds);
    let userProfileForClevertap = {};
    userProfileForClevertap["Content_language"] = contentLangValues;
    this.clevertapService.updateClevertapUserProfile(userProfileForClevertap, false, null);
    this.popupService.closePopup();
    this.commonService.goToURL("/home");
  }

}

export class contentLanguageItem {
  displayText: string;
  languageId: string;
  selected: boolean
}
