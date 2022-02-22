import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JssorService {

  constructor() { }
  isJssorInitialized: boolean = false;
  private isJssorInitializeComplete: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  setIsJssorInitializeComplete(status: boolean) {
    this.isJssorInitializeComplete.next(status);
  }

  getIsJssorInitializeComplete(): boolean {
    return this.isJssorInitializeComplete.getValue();
  }

}


export class JssorItem {
  sliderId: string;
  sliderIndex: string;
}
