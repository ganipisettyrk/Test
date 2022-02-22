import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonService } from 'src/app/utils/common.service';
import { CustomTranslateService } from 'src/app/utils/custom-translate.service';
import { PurchaseService } from 'src/app/utils/purchase.service';

declare var stopAudio;

@Component({
  selector: 'app-profile-popup-data',
  templateUrl: './profile-purchase-data.component.html'
})

export class ProfilePurchaseDataComponent implements OnInit {

  @Input() data: any;

  @Output() profileTimeSelected = new EventEmitter<any>();
  @Output() selectedProfileItem = new EventEmitter<any>();

  constructor(private translate: CustomTranslateService,
    private commonService: CommonService,
    private purchaseService: PurchaseService) { }

  item: any;
  showProfileDurationError = false;
  selectedDay: string = '0';
  selectedHour: string = '1';
  selectedMins: string = '0';

  days: any = [];
  hours: any = [];
  minutes: any = [];

  popupDataReady = false;
  priceDescField: string;
  profilePrice: string;
  profileDefaultImage: string;
  profileLangDisplayText: string;
  profileItemLangDisplayList: any = [];
  profileItemLangMap: any = new Map();
  firstProfileItemLang: string;

  ngOnInit() {
    this.item = this.data;
    if (this.item.subtype && this.item.subtype.type == 'ringback_profile') {
      this.priceDescField = this.translate.instant('pwa.existing.user.price.description.field');
      this.profileDefaultImage = this.translate.instant('pwa.profiles.item.default.image');
      this.profileLangDisplayText = this.translate.instant('pwa.profiles.language.display.text');

      this.days = Array(30).fill(0).map((x, i) => i);
      this.hours = Array(24).fill(0).map((x, i) => i);
      this.minutes = Array(60).fill(0).map((x, i) => i);

      let profileItems = this.commonService.getSelectedProfileItems();

      if (null != profileItems) {
        let langDisplayText = this.profileLangDisplayText.split(',');
        for (let i = 0; i < langDisplayText.length; i++) {
          for (let j = 0; j < profileItems.length; j++) {
            if (langDisplayText[i].split(':')[0] == profileItems[j].language) {
              this.profileItemLangDisplayList.push(langDisplayText[i].split(':')[1]);
              this.profileItemLangMap.set(langDisplayText[i].split(':')[1], profileItems[j]);
            }
          }
        }
        this.firstProfileItemLang = this.profileItemLangDisplayList[0];
      }
    }
    let profileDuration = this.getProfileDurationSelected();
    if (profileDuration == 'invalid_profile_duration') {
      this.showProfileDurationError = true;
      this.popupDataReady = true;
      return;
    }
    this.profileTimeSelected.emit(profileDuration);
    this.profilePrice = this.purchaseService.getExistingUserPriceDescription(this.priceDescField, this.item);
  }

  onLanguageSelect(event) {
    stopAudio();
    let selectedLang = event.target.value;
    this.item = this.profileItemLangMap.get(selectedLang);
    this.selectedProfileItem.emit(this.item);
    this.profilePrice = this.purchaseService.getExistingUserPriceDescription(this.priceDescField, this.item);
  }

  onDaysSelect(event) {
    this.showProfileDurationError = false;
    this.selectedDay = event.target.value;
    let profileDuration = this.getProfileDurationSelected();
    this.profileTimeSelected.emit(profileDuration);
  }

  onHoursSelect(event) {
    this.showProfileDurationError = false;
    this.selectedHour = event.target.value;
    let profileDuration = this.getProfileDurationSelected();
    this.profileTimeSelected.emit(profileDuration);
  }

  onMinsSelect(event) {
    this.showProfileDurationError = false;
    this.selectedMins = event.target.value;
    let profileDuration = this.getProfileDurationSelected();
    this.profileTimeSelected.emit(profileDuration);
  }

  getProfileDurationSelected() {
    let profileDateTime = 'P';
    if ((!this.selectedDay || this.selectedDay == '0')
      && (!this.selectedHour || this.selectedHour == '0')
      && (!this.selectedMins || this.selectedMins == '0')) {
      return 'invalid_profile_duration';
    } else {
      if (this.selectedDay) {
        profileDateTime += this.selectedDay + 'DT';
      }
      if (this.selectedHour) {
        profileDateTime += this.selectedHour + 'H';
      }
      if (this.selectedMins) {
        profileDateTime += this.selectedMins + 'M';
      }
    }
    // console.log('profileDateTime: ' + profileDateTime);
    return profileDateTime;
  }

}