import { Injectable, Injector } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { CommonService } from './common.service';
import { CustomTranslateService } from './custom-translate.service';
import { GdprService } from './gdpr.service';

declare var initializeClevertapFromScript, updateEvent, updateProfile,
  getCleverTapID, pushCTNotifications, pushCTNotificationsForGDPR;

@Injectable({
  providedIn: 'root'
})

export class ClevertapService {

  private isCTInitialized = new Subject<boolean>();
  private isCTInitializedBehaviourSub: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  private eventItemsToUpdate: CTEventItem[] = [];
  private profileItemsToUpdate: CTUserProfileItem[] = [];
  private isCTUserUpdateRequired: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private translateService: CustomTranslateService, private deviceService: DeviceDetectorService,
    private injector: Injector, private gdprService: GdprService) { }

  setIsCTInitialized(status: boolean) {
    this.isCTInitialized.next(status);
    this.isCTInitializedBehaviourSub.next(status);
  }

  getIsCTInitializedSubscribe(): Observable<boolean> {
    return this.isCTInitialized.asObservable();
  }

  getIsCTInitialized(): boolean {
    return this.isCTInitializedBehaviourSub.getValue();
  }

  setIsCTUserUpdateRequired(status: boolean) {
    this.isCTUserUpdateRequired.next(status);
  }

  getIsCTUserUpdateRequired(): boolean {
    return this.isCTUserUpdateRequired.getValue();
  }

  initializeClevertap(accountId: string): void {
    initializeClevertapFromScript(accountId);
    this.setIsCTInitialized(true);
  }

  updateClevertapEvent(eventName: string, sessionCheckRequired: boolean, dataSessionObject: string, data: any): void {

    let canSendDetails: boolean = this.gdprService.checkIfGDPRConsentApproved();
    let update: boolean = false;

    if (canSendDetails) {
      if (sessionCheckRequired) {
        let value = sessionStorage.getItem(eventName);
        if (value) {
          if (value != "true") {
            sessionStorage.setItem(eventName, "true");
            update = true;
          }
        }
        else {
          sessionStorage.setItem(eventName, "true");
          update = true;
        }
      } else {
        update = true;
      }
    }

    if (update) {
      let ctData: any = {}
      if (null != dataSessionObject) {
        ctData = JSON.parse(sessionStorage.getItem(dataSessionObject));
      }
      else {
        if (eventName == "Auto_login") {
          let storeId = sessionStorage.getItem("storeId");
          let wasHeaderUser: boolean = localStorage.getItem("isHeaderUser") == "true";
          let contestUser: boolean = sessionStorage.getItem("contestUser") == "true";
          let contestDecryptFailed: boolean = sessionStorage.getItem("contestDecryptFailed") == "true";
          let status = "Failure";
          let type = "header";
          if (wasHeaderUser) {
            let encryptedMsisdn = localStorage.getItem("token");
            if (null != encryptedMsisdn) {
              status = "Success";
            }
          } else if (contestUser) {
            status = "Success";
            type = "contest";
          }
          else if (contestDecryptFailed) {
            status = "Failure";
            type = "contest";
            sessionStorage.removeItem("contestDecryptFailed");
          }
          ctData = {
            "storeid": storeId,
            "status": status,
            "type": type
          };
          sessionStorage.setItem('Auto_Login_data', JSON.stringify(ctData)); //this will be used to push the same data to GTM
        }
        else if (data) {
          ctData = data;
        }
      }

      let isCTReady: boolean = this.getIsCTInitialized();

      if (isCTReady) {
        updateEvent(eventName, ctData);
      }
      else {
        let CTEventObj: CTEventItem = { eventName: eventName, ctData: ctData };
        this.eventItemsToUpdate.push(CTEventObj);
      }
    }
  }

  updateClevertapUserProfile(data: any, sessionCheckRequired: boolean, sessionKey: string): void {

    let canSendDetails: boolean = this.gdprService.checkIfGDPRConsentApproved();
    if (canSendDetails) {
      let update: boolean = false;
      if (sessionCheckRequired) {
        let value = sessionStorage.getItem(sessionKey);
        if (value) {
          if (value != "true") {
            sessionStorage.setItem(sessionKey, "true");
            update = true;
          }
        }
        else {
          sessionStorage.setItem(sessionKey, "true");
          update = true;
        }
      } else {
        update = true;
      }

      if (update) {

        let isCTReady: boolean = this.getIsCTInitialized();
        if (isCTReady) {
          updateProfile(data);
        }
        else {
          let CTUserProfileItemObj: CTUserProfileItem = { data: data };
          this.profileItemsToUpdate.push(CTUserProfileItemObj);
        }
      }
    }
  }

  // To get CleverTap userId, user is not required to login into PWA.
  updateCleverTapUserId() {
    // getCleverTapID();
    let canSendDetails: boolean = this.gdprService.checkIfGDPRConsentApproved();
    if (canSendDetails) {
      let ctUserId = localStorage.getItem('CT_USER_ID');
      let notificationsUserId = localStorage.getItem('NOTIFICATIONS_API_USER_ID');
      if (null != ctUserId && null != notificationsUserId) {
        this.sendCleverTapDataToVoltron(ctUserId, notificationsUserId);
      }
    }
  }

  sendCleverTapDataToVoltron(ctUserId, notificationsUserId) {
    let canSendDetails: boolean = this.gdprService.checkIfGDPRConsentApproved();
    if (canSendDetails) {
      let browsingLanguage = localStorage.getItem("browsingLanguage");
      let utmParams: string;
      if (this.deviceService.isDesktop()) {
        utmParams = sessionStorage.getItem('UTM_PARAMS');
      } else {
        utmParams = localStorage.getItem('UTM_PARAMS');
      }

      let params = {
        language: browsingLanguage,
        ctUserId: ctUserId,
        os_version: this.deviceService.getDeviceInfo().userAgent,
        utm_params: utmParams,
        notificationsUserId: notificationsUserId
      }
      const commonService = this.injector.get(CommonService);
      commonService.checkAndInitializeWorker("clevertapUpdateVoltron", params);
    }
  }

  updateCTUserDetailsToVoltron(): void {

    this.getClevertapId()
      .subscribe(ctUserId => {
        if (ctUserId) {
          this.sendCleverTapDataToVoltron(ctUserId, null);
        }
      });
  }

  pushNotifications(fromGDPRPermssion: boolean) {
    let isCTNotificationsEnabled = this.translateService.instant('pwa.enable.clevertap.push.notifications') == 'true';
    if (isCTNotificationsEnabled) {
      let canSendDetails: boolean = this.gdprService.checkIfGDPRConsentApproved();
      if (canSendDetails) {
        if (!fromGDPRPermssion) {
          this.translateService.get("pwa.clevertap.notifications.title.text")
            .subscribe(resp => {
              let titleText = resp;
              let contextPath = this.translateService.instant("pwa.context.path");
              let bodyText = this.translateService.instant("pwa.clevertap.notifications.body.text");
              let okBtnText = this.translateService.instant("pwa.clevertap.notifications.ok.button.text");
              let rejectBtnText = this.translateService.instant("pwa.clevertap.notifications.reject.button.text");
              let okBtnColor = this.translateService.instant("pwa.clevertap.notifications.ok.button.color");
              let askAgainTime = Number(this.translateService.instant("pwa.clevertap.notifications.ask.again.time"));
              let delayTimeout = Number(this.translateService.instant("pwa.clevertap.notifications.popup.delay.time"));
              setTimeout(() => {
                // This is done bcoz user permission popup is shown immediately after launching pwa portal
                pushCTNotifications(contextPath, titleText, bodyText, okBtnText, rejectBtnText, okBtnColor, askAgainTime);
              }, delayTimeout);
            });
        }
        else {
          let contextPath = this.translateService.instant("pwa.context.path");
          pushCTNotificationsForGDPR(contextPath);
        }
      }
    }
  }

  getClevertapId(): Observable<string> {
    return new Observable((observer) => {
      let refId = setInterval(() => {
        let ctUserId = localStorage.getItem('CT_USER_ID');
        if (ctUserId == null || "null" == ctUserId) {
          ctUserId = getCleverTapID();
          if (ctUserId != null && "null" != ctUserId && ctUserId !== undefined) {
            observer.next(ctUserId);
            observer.complete();
          }
        } else {
          clearInterval(refId);
        }
      }, 2000);
    })
  }

  updateCTEvents(): void {
    if (this.eventItemsToUpdate && this.eventItemsToUpdate.length > 0) {
      for (let eventItem of this.eventItemsToUpdate) {
        updateEvent(eventItem.eventName, eventItem.ctData);
      }
    }
  }

  updateCTUserProfiles(): void {
    if (this.profileItemsToUpdate && this.profileItemsToUpdate.length > 0) {
      for (let profileItem of this.profileItemsToUpdate) {
        updateProfile(profileItem.data);
      }
    }
  }

  updateCTUserDetails(): void {
    let isUpdateRequired = this.getIsCTUserUpdateRequired();
    if (isUpdateRequired) {
      this.updateCTUserDetailsToVoltron();
    }
  }
}

export class CTEventItem {
  eventName: string;
  ctData: any;
}

export class CTUserProfileItem {
  data: any;
}