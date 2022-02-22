import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ToasterMessageService {

  type: string;
  message: string;
  private showToasterMessageSource = new Subject<boolean>();

  constructor() { }

  private setToasterMessageSource(status: boolean) {
    this.showToasterMessageSource.next(status);
  }
  getToasterMessageSource(): Observable<boolean> {
    return this.showToasterMessageSource.asObservable();
  }

  toggleToasterMessageDisplay(display: boolean, type: string, message: string) {
    if (display) {
      this.type = type;
      this.message = message;
    }
    else {
      this.type = null;
      this.message = null;
    }

    this.setToasterMessageSource(display);
  }
}
