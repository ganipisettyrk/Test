import { Component, OnInit, Input } from '@angular/core';
import { PopupService } from '../popup.service';
import { CustomTranslateService } from 'src/app/utils/custom-translate.service';
import { UserActivityService } from 'src/app/user-activity/user-activity.service';

@Component({
    selector: 'app-unsubscribe-popup',
    templateUrl: './unsubscribe-popup.component.html'
})

export class UnsubscribePopupComponent implements OnInit {

    @Input() isMobile: boolean;
    @Input() heading: string;

    subheading: string;
    unsubscribeResponse: string;
    showUnsubscribeResp = false;

    constructor(public popupService: PopupService,
        private translate: CustomTranslateService,
        private activityService: UserActivityService) {}

    ngOnInit() {
        
    }

    unsubscribeService() {
        let subscriptionId = sessionStorage.getItem('CURRENT_SUBSCRIPTION_ID');

        this.activityService.unsubscribeService(subscriptionId)
        .subscribe(resp => {
            this.showUnsubscribeResp = true;
            if (resp && resp.status != 'failure') {
                sessionStorage.setItem('UNSUBSCRIBE_REQUESTED', 'true');
                this.subheading = this.translate.instant('pwa.unsubscribe.success.resp.subheading');
                this.unsubscribeResponse = this.translate.instant('pwa.unsubscribe.success.resp.description');
            } else {
                this.subheading = this.translate.instant('pwa.unsubscribe.failure.resp.subheading');
                this.unsubscribeResponse = this.translate.instant('pwa.unsubscribe.failure.resp.description');
            }
        })
    }
    
}
