import { Component, HostListener, Input, OnInit } from '@angular/core';
import { SimpleTimer } from 'ng2-simple-timer';
import { Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/utils/authentication.service';
import { CommonService } from 'src/app/utils/common.service';
import { CustomScriptLoaderService, ScriptItem } from 'src/app/utils/custom-script-loader.service';
import { CustomTranslateService } from 'src/app/utils/custom-translate.service';

declare var callWebOTP;

@Component({
  selector: 'app-login-data',
  templateUrl: './login-data.component.html',
  styleUrls: ['./login-data.component.css']
})
export class LoginDataComponent implements OnInit {

  @Input() isMobile: boolean;
  @Input() type: string;

  user: any = {};
  otpData: any = {};

  msisdnValue: string = null;
  otpValue: string = null;

  classForMSISDN: string = "register_txt";
  classForOTP: string = "register_txt_otp";
  counter: number = 0;

  invalidMSISDNDescription: string = null;
  sameMsisdnError = false;

  maxLengthMsisdn: number;
  maxLengthOtp: number;
  resendOtpClicksAllowed: number;
  timerCount: number;
  redirectTimerCount: number;

  istncTextEnabledAtLogin: boolean = false;
  hideMsisdn: boolean = false;

  private otpSub: Subscription;
  private otpGeneratedSub: Subscription;
  private msisdnClassSub: Subscription;
  private otpClassSub: Subscription;
  private msisdnValiditySub: Subscription;
  private loggedInSub: Subscription

  timerId: string;
  enableResendOtpLink: boolean = false;
  otpGenerated: boolean = false;

  isTimerStarted: boolean = false;
  isMaxOtpGenerationReached: boolean = false;


  constructor(private translate: CustomTranslateService, private simpleTimer: SimpleTimer,
    private authenticationService: AuthenticationService,
    private commonService: CommonService, private customScriptLoader: CustomScriptLoaderService) { }

  ngOnInit() {

    let scriptItem: ScriptItem = { name: "webOTP", src: "scripts/webotp.min.js" };

    this.customScriptLoader.loadScript(scriptItem).subscribe(
      (res: boolean) => {
        if (res) {
          this.getInitialData();
        }
      });

    this.otpGeneratedSub = this.authenticationService.getOTPGenerated().subscribe(res => {
      this.otpGenerated = res;
      if (this.otpGenerated) {
        this.initiateTimer(this.timerCount, "otpTimer");
      }
    });

    this.loggedInSub = this.authenticationService.getLoggedInResult().subscribe(
      res => {
        if (!res) {
          this.user["otp"] = null;
          this.otpValue = null;
          this.initiateTimer(this.timerCount, "otpTimer");
        }
      });

    this.msisdnClassSub = this.authenticationService.getClassForMSISDN().subscribe(
      res => {
        this.classForMSISDN = res;
      });

    this.otpClassSub = this.authenticationService.getClassForOTP().subscribe(
      res => {
        this.classForOTP = res;
      });

    this.otpSub = this.authenticationService.getOTPData().subscribe(
      res => {
        this.otpData = res;
      });

    this.msisdnValiditySub = this.authenticationService.getInvalidMsisdnDescription().subscribe(
      res => {
        if (res) {
          this.invalidMSISDNDescription = res;
          let isBlockedUserError = sessionStorage.getItem("blockedDescription");
          if (isBlockedUserError != null) {
            sessionStorage.removeItem("blockedDescription");
            this.initiateTimer(this.redirectTimerCount, "blockedUserTimer");
          }
          this.isMaxOtpGenerationReached = sessionStorage.getItem("isMaxOtpGenerationReached") == 'true';
        }
      });
  }

  getInitialData(): void {
    this.otpData = {
      'isMaxAttemptsReached': false,
      'invalidOtp': false
    };
    this.otpGenerated = false;
    this.istncTextEnabledAtLogin = this.translate.instant("pwa.login.enable.tnc.text");
    this.maxLengthMsisdn = this.translate.instant('pwa.msisdn.max.length');
    this.maxLengthOtp = this.translate.instant('pwa.otp.max.length');
    this.resendOtpClicksAllowed = this.translate.instant('pwa.resend.otp.attempts');
    this.timerCount = this.translate.instant('pwa.resend.otp.timer.value');
    this.redirectTimerCount = this.translate.instant('pwa.blocked.user.timer.value');
    let blockedUserDesc = sessionStorage.getItem("blockedDescription");
    let contestUserErrorDesc = sessionStorage.getItem("contestUserErrorDesc");

    if (null != blockedUserDesc) {
      this.invalidMSISDNDescription = blockedUserDesc;
      sessionStorage.removeItem("blockedDescription");
      this.hideMsisdn = true;
      this.initiateTimer(this.redirectTimerCount, "blockedUserTimer");
    } else if (null != contestUserErrorDesc) {
      this.invalidMSISDNDescription = contestUserErrorDesc;
      sessionStorage.removeItem("contestUserErrorDesc");
      this.hideMsisdn = true;
    }
  }

  textBoxOnChange(fromMsisdn: boolean): void {
    if (fromMsisdn) {
      sessionStorage.removeItem("isMaxOtpGenerationReached");
    }
    this.invalidMSISDNDescription = null;
    this.clearValue();
  }

  private clearValue(): void {
    if (this.timerId) {
      this.simpleTimer.unsubscribe(this.timerId);
      this.timerId = undefined;
    }
    this.otpData['invalidOtp'] = false;
    this.otpData['isMaxAttemptsReached'] = false;
    this.sameMsisdnError = false;
  }

  sendOtp() {
    this.isMaxOtpGenerationReached = sessionStorage.getItem("isMaxOtpGenerationReached") == 'true';
    if (!this.isMaxOtpGenerationReached && this.msisdnValue != this.user["msisdn"]) {
      this.msisdnValue = this.user["msisdn"];
      this.msisdnValue = this.commonService.getSafeValue(this.msisdnValue);
      this.invalidMSISDNDescription = null;
      this.otpGenerated = false;
      this.clearValue();
      this.timerId = undefined;

      if (this.type == 'changenumber' && this.msisdnValue.length == this.maxLengthMsisdn) {
        this.commonService.getMsisdnAsObservable()
          .subscribe(msisdn => {
            if (msisdn == this.msisdnValue) {
              this.sameMsisdnError = true;
              return;
            }
            this.authenticationService.sendOtp(this.msisdnValue, this.maxLengthMsisdn, this.type);
            this.otpGenerated = true;
            setTimeout(() => {
              callWebOTP();
            }, 2);
          });
      } else {
        if (this.msisdnValue.length == this.maxLengthMsisdn) {
          this.authenticationService.sendOtp(this.msisdnValue, this.maxLengthMsisdn, this.type);
          this.otpGenerated = true;
          setTimeout(() => {
            callWebOTP();
          }, 2);
        }
      }
    }
  }

  validateOtp(otpValueStr?: string) {
    let validate: boolean = false;
    if (otpValueStr) {
      this.otpValue = otpValueStr;
      this.otpValue = this.commonService.getSafeValue(this.otpValue);
      validate = true;
    } else {
      if (this.user["otp"] && this.otpValue != this.user["otp"]) {
        this.otpValue = this.user["otp"];
        this.otpValue = this.commonService.getSafeValue(this.otpValue);
        validate = true;
      }
    }
    if (validate) {
      this.clearValue();
      this.authenticationService.validateOtp(this.otpValue, this.maxLengthOtp, this.isMobile, this.type);
    }
  }
  resendOTP() {
    this.otpGenerated = false;
    this.timerId = undefined;
    this.clearValue();
    let result: boolean = this.authenticationService.resendOtp(this.resendOtpClicksAllowed);
    callWebOTP();
    if (result) {
      this.user['msisdn'] = null;
      this.msisdnValue = null;
    }

  }

  private startTimer(timerName: string) {
    this.isTimerStarted = true;
    if (this.timerId) {
      this.simpleTimer.unsubscribe(this.timerId);
      this.timerId = undefined;
    } else {
      if (timerName == "otpTimer") {
        this.enableResendOtpLink = false;
      }
      this.timerId = this.simpleTimer.subscribe(timerName, () => this.timerCallback(timerName));
    }
  }

  private timerCallback(timerName: string) {
    if (this.counter > 0) {
      this.counter--;
    } else {
      if (timerName == "blockedUserTimer") {
        this.redirectForPostPaid();
      } else if (timerName == "otpTimer") {
        this.enableResendOtpLink = true;
      }
    }
  }

  private initiateTimer(timerCount: number, timerName: string): void {
    this.counter = timerCount;
    if (this.isTimerStarted) {
      this.simpleTimer.delTimer(timerName);
    }
    this.simpleTimer.newTimer(timerName, 1);
    this.startTimer(timerName);
  }

  private redirectForPostPaid() {
    let redirectUrl = this.translate.instant('pwa.redirect.url.for.blocked.user');
    window.location.href = redirectUrl;
  }

  @HostListener('window:otp-read', ['$event'])
  otpReadByScript(event) {
    this.validateOtp(event.detail.otpValue);
  }

  ngOnDestroy() {
    this.otpGeneratedSub.unsubscribe();
    this.otpClassSub.unsubscribe();
    this.msisdnClassSub.unsubscribe();
    this.msisdnValiditySub.unsubscribe();
    this.otpSub.unsubscribe();
    this.loggedInSub.unsubscribe();
    this.timerId = undefined;

  }
}
