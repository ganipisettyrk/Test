import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NavigationStart, Router } from '@angular/router';
import { SimpleTimer } from 'ng2-simple-timer';
import { CommonService } from '../utils/common.service';
import { CustomTranslateService } from '../utils/custom-translate.service';
import { FeedbackService } from './feedback.service';

declare var $: any;

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css']
})
export class FeedbackComponent implements OnInit {

  msisdn: string;
  isFeedbackValid: boolean;
  @Output() displayMenuValue = new EventEmitter<boolean>();

  constructor(private feedbackService: FeedbackService, private commonService: CommonService,
    private translate: CustomTranslateService, private router: Router, private simpleTimer: SimpleTimer) { }

  ngOnInit() {
    this.commonService.isUserLoggedIn()
      .subscribe((isLoggedIn: boolean) => {
        if (!isLoggedIn) {
          // If the user not logged in and trying to access feedback page, will redirect him to home page.
          this.router.navigateByUrl('/home');
        }
      });

    this.isFeedbackValid = false;
    this.initFeedback();
    setTimeout(() => {
      this.commonService.setFooterDisplayStatus(true);
    }, 2);
    this.commonService.setLoadFooterVal(true);
  }

  initFeedback() {
    this.commonService.getMsisdnAsObservable().subscribe(
      msisdn => {
        this.msisdn = msisdn;
      });
  }

  submitFeedback(formGroup: NgForm): void {
    if (formGroup.invalid) {
      this.isFeedbackValid = false;
    }
    else {
      this.feedbackService.submitFeedback(formGroup).subscribe(response => {
        if (response != null && response) {
          this.isFeedbackValid = true;
          this.startFeedbackTimer();
          this.router.events.subscribe((val) => {
            if (val instanceof NavigationStart) {
              this.simpleTimer.delTimer('feedbackTimer');
            }
          });
        }
      }, error => {
        this.router.navigateByUrl('/error');
      })
    }
  }

  startFeedbackTimer(): void {
    this.translate.get('pwa.feedback.success.redirect.time')
      .subscribe((res: number) => {
        this.simpleTimer.newTimer('feedbackTimer', res);
        let timercheck: boolean = false;
        let timerId = this.simpleTimer.subscribe('feedbackTimer', () => {
          if (timercheck) {
            this.router.navigateByUrl("/home")
            this.simpleTimer.unsubscribe(timerId);
            this.simpleTimer.delTimer('feedbackTimer');
          }
          timercheck = true;
        });
      });
  }
}
