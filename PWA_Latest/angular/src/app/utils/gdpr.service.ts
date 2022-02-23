import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CustomTranslateService } from './custom-translate.service';

@Injectable({
  providedIn: 'root'
})
export class GdprService {

  private showOrHideGDPRPermission = new BehaviorSubject<boolean>(null);

  constructor(private translate: CustomTranslateService) { }

  getGDPRPermissionVisibility(): Observable<boolean> {
    return this.showOrHideGDPRPermission.asObservable();
  }

  setGDPRPermissionVisibility(visibility: boolean) {
    this.showOrHideGDPRPermission.next(visibility);
  }

  public checkIfGDPRConsentApproved(): boolean {
    let isGDPREnabled: boolean = this.isGDPRFeatureEnabled();
    let isGDPRConsentApproved: boolean = this.isGDPRConsentApproved();
    if (!isGDPREnabled || (isGDPREnabled && isGDPRConsentApproved)) {
      return true;
    }
    else {
      return false;
    }
  }

  private isGDPRConsentApproved(): boolean {
    return localStorage.getItem("GDPRConsent") == 'true';
  }

  public isGDPRFeatureEnabled(): boolean {
    return this.translate.instant("pwa.enable.gdpr.permission") == 'true';
  }

}
