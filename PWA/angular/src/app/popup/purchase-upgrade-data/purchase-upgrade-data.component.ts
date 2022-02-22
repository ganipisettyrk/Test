import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { ClevertapService } from 'src/app/utils/clevertap.service';
import { CommonService } from 'src/app/utils/common.service';
import { GTMService } from 'src/app/utils/gtm.service';

@Component({
    selector: 'app-upgrade-popup-data',
    templateUrl: './purchase-upgrade-data.component.html'
})

export class PurchaseUpgradeDataComponent implements OnInit {

    @Input() data: any;
    @Input() isNewUser: boolean;

    @Output() catalogSubsId = new EventEmitter<string>();

    upgradePopupMsg: string;
    upgradePopupHeading: string;

    catalogSubscriptionId: string;

    constructor(private commonService: CommonService,
        private gtmService: GTMService,
        private clevertapService: ClevertapService) { }

    ngOnInit() {
        let setConfirmCTObj = {};

        let contentMetadata = this.data;

        if (!this.isNewUser && contentMetadata.availability.length > 0
            && contentMetadata.availability[0].restrictions
            && contentMetadata.availability[0].restrictions.length > 0) {
            this.commonService.setHidePopupContentImage(true);
            this.catalogSubscriptionId = contentMetadata.availability[0].restrictions[0].value;
            this.catalogSubsId.emit(this.catalogSubscriptionId);
            this.upgradePopupMsg = contentMetadata.availability[0].individual[0].description;
            setConfirmCTObj = JSON.parse(sessionStorage.getItem('SET_CLICK_CT_EVENT_DATA'))
            setConfirmCTObj['upgrade_to_plan_id'] = this.catalogSubscriptionId;
            setConfirmCTObj['upgrade_from_plan_id'] = sessionStorage.getItem('CURRENT_SUBSCRIPTION_ID');
            setConfirmCTObj['purchase_type'] = 'Subscription and Tune';
            sessionStorage.setItem('SET_UPGRADE_CT_EVENT_DATA', JSON.stringify(setConfirmCTObj));
            this.clevertapService.updateClevertapEvent("SET_Upgrade", false, null, setConfirmCTObj);
            let gtmEventObj = JSON.parse(JSON.stringify(setConfirmCTObj));
            if (null != gtmEventObj) {
                gtmEventObj['event'] = 'SET_Upgrade';
                this.gtmService.pushGTMEvent(gtmEventObj, false, 'GTM_SET_Upgrade');
            }
        } else {
            this.commonService.setHidePopupContentImage(false);
        }

    }


} 