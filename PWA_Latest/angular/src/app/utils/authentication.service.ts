import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { PopupService } from '../popup/popup.service';
import { HttpRequestService } from '../utils/http-request.service';
import { ClevertapService } from './clevertap.service';
import { CommonService } from './common.service';
import { GTMService } from './gtm.service';

@Injectable({
  providedIn: 'root'
})

export class AuthenticationService {

  msisdn: string = null;
  resendOtpClicks: number = 0;
  otpData: any = {};
  otpCountForClevertapEvent = 0;
  otpResendCountForClevertapEvent = 0;

  private isLoggedIn = new Subject<boolean>();
  private invalidMsisdnDescription = new Subject<string>();

  private classForMsisdn = new Subject<string>();
  private classForOtp = new Subject<string>();

  private OTPDataSubject = new Subject<string>();
  private OTPGenerated = new Subject<boolean>();

  constructor(private httpService: HttpRequestService, private clevertapService: ClevertapService,
    private gtmService: GTMService, private commonService: CommonService,
    private popupService: PopupService) {

  }

  setLoggedInResult(status: boolean) {
    this.isLoggedIn.next(status);
  }
  getLoggedInResult(): Observable<boolean> {
    return this.isLoggedIn.asObservable();
  }

  setInvalidMsisdnDescription(description: string) {
    this.invalidMsisdnDescription.next(description);
  }
  getInvalidMsisdnDescription(): Observable<string> {
    return this.invalidMsisdnDescription.asObservable();
  }
  setClassForOTP(classStr: string) {
    this.classForOtp.next(classStr);
  }
  getClassForOTP(): Observable<string> {
    return this.classForOtp.asObservable();
  }

  setClassForMSISDN(classStr: string) {
    this.classForMsisdn.next(classStr);
  }
  getClassForMSISDN(): Observable<string> {
    return this.classForMsisdn.asObservable();
  }

  setOTPData(data: string) {
    this.OTPDataSubject.next(data);
  }
  getOTPData(): Observable<string> {
    return this.OTPDataSubject.asObservable();
  }

  setOTPGenerated(status: boolean) {
    this.OTPGenerated.next(status);
  }
  getOTPGenerated(): Observable<boolean> {
    return this.OTPGenerated.asObservable();
  }


  sendOtp(msisdnStr: string, maxLength: number, type: string) {
    let generateOTP_CTEventObject = {};
    let gtmEventObj = {};
    this.otpData = {};
    this.setOTPData(this.otpData);
    this.setInvalidMsisdnDescription(null);
    this.resetValue();
    sessionStorage.removeItem("isMaxOtpGenerationReached");

    generateOTP_CTEventObject['Attempt_counter_per_session'] = ++this.otpCountForClevertapEvent;
    this.setClassForMSISDN('register_txt register_txt_load');
    this.msisdn = msisdnStr;
    let requestDetails = {
      "msisdn": this.msisdn,
      "type": type
    };
    this.httpService.post("generateotp", requestDetails, null).subscribe(
      response => {
        if (response.result == "otp_generated") {
          this.setClassForMSISDN('register_txt register_txt_tick');
          this.setOTPGenerated(true);
          generateOTP_CTEventObject["Request status"] = "success"
        } else {
          this.otpNotGenerated(response);
        }
        this.clevertapService.updateClevertapEvent("OTP_request", false, null, generateOTP_CTEventObject);
        gtmEventObj = JSON.parse(JSON.stringify(generateOTP_CTEventObject));
        if (null != gtmEventObj) {
          gtmEventObj['event'] = 'OTP_request';
          this.gtmService.pushGTMEvent(gtmEventObj, false, 'GTM_OTP_request');
        }
      }, error => {
        this.setClassForMSISDN('register_txt');
        generateOTP_CTEventObject["Request status"] = "failure"
        generateOTP_CTEventObject["Failure reason"] = error;
        this.clevertapService.updateClevertapEvent("OTP_request", false, null, generateOTP_CTEventObject);
        // console.log("Error while generating otp.");
        gtmEventObj = JSON.parse(JSON.stringify(generateOTP_CTEventObject));
        if (null != gtmEventObj) {
          gtmEventObj['event'] = 'OTP_request';
          this.gtmService.pushGTMEvent(gtmEventObj, false, 'GTM_OTP_request');
        }
      });

  }


  validateOtp(otpStr: string, otpLength: number, isMobile: boolean, type: string) {
    if (otpStr.length == otpLength) {
      let otpValidationEvent = {};
      let gtmEventObj = {};
      this.resetOTPFields();
      this.setClassForOTP('register_txt_otp register_txt_load');

      let requestDetails = {
        "msisdn": this.msisdn,
        "pin": otpStr
      };
      this.httpService.post("validateotp", requestDetails, null).subscribe(
        response => {
          if (response.result == "valid_user") {
            let userProfileForClevertap = {};
            userProfileForClevertap["Last_login"] = true;
            let currentDate: Date = new Date();
            userProfileForClevertap["Last_login_date"] = currentDate.toDateString();
            otpValidationEvent['Status'] = "success";
            this.setClassForOTP('register_txt register_txt_tick');
            sessionStorage.setItem("storeId", response.storeId);
            if (isMobile) {
              //Need to store MSISDN in local storage only in Mobile
              this.commonService.setEncryptedValuesInLocalStorage(response, "false");
              //This must be done else appcomponent has hits which are not required for OTP flow
              sessionStorage.removeItem("headerCheckInitiated");
            }
            sessionStorage.removeItem('PWALaunchforKPI');
            if (type == 'changenumber') {
              //we should remove the contentIds stored for recommendations, when user changes number
              localStorage.removeItem('contentIds');
              localStorage.removeItem('userId');
              sessionStorage.removeItem('userId');
              //This must be done so that new UTM params can be updated on change number
              if (isMobile) {
                localStorage.removeItem("UTM_PARAMS");
              } else {
                sessionStorage.removeItem("UTM_PARAMS");
              }
              this.commonService.clearUTMParamsFromCT();
            }
            sessionStorage.setItem("loggedIn", "true");
            this.clevertapService.updateClevertapUserProfile(userProfileForClevertap, false, null);
            this.setLoggedInResult(true);
            this.clevertapService.updateCleverTapUserId();
          }
          else {
            otpValidationEvent['Status'] = "failure";
            otpValidationEvent['Failure reason'] = response.result;
            this.setClassForOTP('register_txt_otp');
            this.setLoggedInResult(false);
            this.otpData['invalidOtp'] = true;
            if (response.result == "wrong_otp_attempts_exceeded") {
              this.otpData['isMaxAttemptsReached'] = true;
            }
            this.setOTPData(this.otpData);

          }
          this.clevertapService.updateClevertapEvent("OTP_Validation", false, null, otpValidationEvent);
          gtmEventObj = JSON.parse(JSON.stringify(otpValidationEvent));
          if (null != gtmEventObj) {
            gtmEventObj['event'] = 'OTP_Validation';
            this.gtmService.pushGTMEvent(gtmEventObj, false, 'GTM_OTP_Validation');
          }

        }, error => {
          // console.log(error);
          otpValidationEvent['Status'] = "failure";
          otpValidationEvent['Failure reason'] = error;
          this.setLoggedInResult(false);
          this.setClassForOTP('register_txt_otp');
          this.otpData['invalidOtp'] = true;
          this.setOTPData(this.otpData);
          this.clevertapService.updateClevertapEvent("OTP_Validation", false, null, otpValidationEvent);
          gtmEventObj = JSON.parse(JSON.stringify(otpValidationEvent));
          if (null != gtmEventObj) {
            gtmEventObj['event'] = 'OTP_Validation';
            this.gtmService.pushGTMEvent(gtmEventObj, false, 'GTM_OTP_Validation');
          }
        }
      );
    }
  }

  resetValue(): void {
    this.msisdn = '';
    this.setClassForMSISDN('register_txt');
    this.resetOTPFields();
  }

  resetOTPFields(): void {
    if (this.otpData['invalidOtp'] == true || this.otpData['isMaxAttemptsReached'] == true) {
      this.otpData['invalidOtp'] = false;
      this.otpData['isMaxAttemptsReached'] = false;
      this.setOTPData(this.otpData);
    }
  }

  resendOtp(resendOtpClicksAllowed: number): boolean {
    let generateOTP_CTEventObject = {};
    let gtmEventObj = {};
    this.setClassForOTP('register_txt_otp');
    this.resetOTPFields();
    generateOTP_CTEventObject['Attempt_counter_per_session'] = ++this.otpCountForClevertapEvent;
    generateOTP_CTEventObject['resend_OTP'] = ++this.otpResendCountForClevertapEvent;

    if (this.resendOtpClicks >= resendOtpClicksAllowed) {
      this.resetValue();
      this.resendOtpClicks = 0;
      return true;
    }

    let requestDetails = {
      "msisdn": this.commonService.getSafeValue(this.msisdn)
    };
    // let params = [];
    // params.push({ paramName: 'msisdn', paramValue: this.msisdn });
    this.httpService.post("generateotp", requestDetails, null).subscribe(
      otpStatus => {
        if (otpStatus.result == "otp_generated") {
          generateOTP_CTEventObject["Request status"] = "success";
          this.setOTPGenerated(true);
          this.setClassForMSISDN('register_txt register_txt_tick');
          this.resendOtpClicks++;
        } else {
          this.otpNotGenerated(otpStatus);
        }
        this.clevertapService.updateClevertapEvent("OTP_request", false, null, generateOTP_CTEventObject);
        gtmEventObj = JSON.parse(JSON.stringify(generateOTP_CTEventObject));
        if (null != gtmEventObj) {
          gtmEventObj['event'] = 'OTP_request';
          this.gtmService.pushGTMEvent(gtmEventObj, false, 'GTM_OTP_request');
        }
      }, error => {
        this.setClassForMSISDN('register_txt');
        generateOTP_CTEventObject["Request status"] = "failure";
        generateOTP_CTEventObject["Failure reason"] = error;
        // console.log("Error while resend otp.");
        this.clevertapService.updateClevertapEvent("OTP_request", false, null, generateOTP_CTEventObject);
        gtmEventObj = JSON.parse(JSON.stringify(generateOTP_CTEventObject));
        if (null != gtmEventObj) {
          gtmEventObj['event'] = 'OTP_request';
          this.gtmService.pushGTMEvent(gtmEventObj, false, 'GTM_OTP_request');
        }
      });
  }

  otpNotGenerated(response) {
    let generateOTP_CTEventObject = {};
    let reason = "";
    if (response.result) {
      reason = response.result;
    } else {
      reason = response;
    }
    generateOTP_CTEventObject["Request status"] = "failure";
    generateOTP_CTEventObject["Failure reason"] = reason;
    this.otpData['invalidOtp'] = false;
    this.otpData['isMaxAttemptsReached'] = false;
    this.setOTPData(this.otpData);
    this.setClassForMSISDN('register_txt');
    if (response.code == "resource_forbidden"
      && response.subCode == "blocked_user") {
      sessionStorage.setItem("blockedDescription", response.description);
    }

    if (response.code == "max_attempts_reached") {
      sessionStorage.setItem("isMaxOtpGenerationReached", "true");
    }
    this.setInvalidMsisdnDescription(response.description);

  }

  public decryptMsisdnForOoredo(params): Observable<any> {
    return this.httpService.get('getoomdn', params);
  }

  public decryptMsisdnForContest(params): Observable<any> {
    return this.httpService.get('getdecryptedcontestdata', params);
  }

}
