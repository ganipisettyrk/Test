import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

declare var $;

@Injectable({
  providedIn: 'root'
})
export class PopupService {

  private showPopupSource = new Subject<boolean>();
  private closePopupSource = new Subject<boolean>();
  private popupDataItem: PopupDataItem;

  constructor() { }

  setShowPopUpSource(status: boolean) {
    this.showPopupSource.next(status);
  }
  getShowPopUpSource(): Observable<boolean> {
    return this.showPopupSource.asObservable();
  }

  setClosePopUpSource(status: boolean) {
    this.closePopupSource.next(status);
  }
  getClosePopUpSource(): Observable<boolean> {
    return this.closePopupSource.asObservable();
  }

  showPopup(data: PopupDataItem): void {
    this.popupDataItem = data;
    this.closePopup();
    this.setShowPopUpSource(true);
  }

  closePopup(): void {
    this.setClosePopUpSource(true);
  }

  getPopUpDataItem(): PopupDataItem {
    return this.popupDataItem;
  }

  updatePopUpDataItem(popupDataItem): void {
    this.popupDataItem = popupDataItem;
  }
}

export class PopupDataItem {
  isLoggedIn: boolean;
  type: string;
  popupData: any;
  heading: string;
  response: string;
  showCloseButton: boolean;
  historyIndex: any;
  pageName: string;
  isSetForNone: boolean;
}
