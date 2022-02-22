import { Component, OnInit, HostListener } from '@angular/core';
import { PopupService } from '../popup.service';
import { CommonService } from 'src/app/utils/common.service';

@Component({
  selector: 'app-mobile-popup',
  templateUrl: './mobile-popup.component.html',
  styleUrls: ['./mobile-popup.component.css']
})
export class MobilePopupComponent implements OnInit {

  heading: string;
  showPopup: boolean = true;
  showCloseButton: boolean;

  constructor(private popupService: PopupService, private commonService: CommonService) { }

  ngOnInit() {
    let popupDataItem = this.popupService.getPopUpDataItem();
    this.heading = popupDataItem.heading;
    this.showCloseButton = popupDataItem.showCloseButton;
    this.commonService.stopBackgroundScroll();
    this.popupService.getClosePopUpSource()
      .subscribe(resp => {
        if (resp) {
          if (popupDataItem.isSetForNone || popupDataItem.type == 'delete_download'
            || popupDataItem.type == 'delete_selection') {
              this.commonService.toggleSliderButtonInActivitySelection(popupDataItem.historyIndex);
            } else if (popupDataItem.pageName == 'activity_history') {
              this.commonService.toggleSliderButtonInActivityHistory(popupDataItem.historyIndex);
            }
          this.closePopup();
        }
      })
  }

  closePopup(fromLogin?: boolean): void {
    if (this.showCloseButton || fromLogin) {
      this.showPopup = false;
    }
    this.commonService.stopPlayerIfApplicable();
    this.commonService.startBackgroundScroll();
  }

  updateClose(value: boolean) {
    if (value) {
      this.closePopup(value);
    }
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    this.closePopup();
  }
}
