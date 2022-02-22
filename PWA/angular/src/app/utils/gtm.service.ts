import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { GdprService } from './gdpr.service';

declare var initiateGTM, pushGTMEvent;

@Injectable({
  providedIn: 'root'
})
export class GTMService {

  private isGTMInitialized = new Subject<boolean>();
  private isGTMInitializedBehaviourSub: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  private eventItemsToUpdate: GTMEventItem[] = [];

  constructor(private gdprService: GdprService) { }

  setIsGTMInitialized(status: boolean) {
    this.isGTMInitialized.next(status);
    this.isGTMInitializedBehaviourSub.next(status);
  }

  getIsGTMInitializedSubscribe(): Observable<boolean> {
    return this.isGTMInitialized.asObservable();
  }

  getIsGTMInitialized(): boolean {
    return this.isGTMInitializedBehaviourSub.getValue();
  }

  initializeGTM(gtmAccId) {
    initiateGTM(gtmAccId);
  }

  pushGTMEvent(eventObj: any, sessionCheckRequired: boolean, gtmEventName: string) {
    let gtmEventTobePushed: boolean = false;
    let canSendDetails: boolean = this.gdprService.checkIfGDPRConsentApproved();
    if (canSendDetails) {
      if (sessionCheckRequired) {
        let isGTMEventPushed = sessionStorage.getItem(gtmEventName);
        if (isGTMEventPushed) {
          if (isGTMEventPushed != 'true') {
            sessionStorage.setItem(gtmEventName, 'true');
            gtmEventTobePushed = true;
          }
        } else {
          sessionStorage.setItem(gtmEventName, 'true');
          gtmEventTobePushed = true;
        }
      } else {
        gtmEventTobePushed = true;
      }
    }
    if (gtmEventTobePushed) {

      let isGTMReady: boolean = this.getIsGTMInitialized();
      if (isGTMReady) {
        pushGTMEvent(eventObj);
      }
      else {
        let GTMEventObj: GTMEventItem = { eventObj: eventObj };
        this.eventItemsToUpdate.push(GTMEventObj);
      }
    }
  }

  updateGTMEvents(): void {
    if (this.eventItemsToUpdate && this.eventItemsToUpdate.length > 0) {
      for (let eventObj of this.eventItemsToUpdate) {
        pushGTMEvent(eventObj);
      }
    }
  }
}

export class GTMEventItem {
  eventObj: any;
}
