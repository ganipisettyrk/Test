import { Component, Input, OnInit } from '@angular/core';
import { PopupService } from '../popup.service';
import { UserActivityService } from './../../user-activity/user-activity.service';
import { CustomTranslateService } from './../../utils/custom-translate.service';

@Component({
    selector: 'app-delete-popup-data',
    templateUrl: './delete-popup-data.component.html',
    styleUrls: ['./delete-popup-data.component.css']
})

export class DeletePopupDataComponent implements OnInit {

    @Input() type: string;
    @Input() selectionItem: any;
    @Input() heading: string;

    popupSubHeading: string;
    popupDesc: string;
    cancelBtnText: string;
    continueBtnText: string;
    closeBtnText: string;
    deleteError: boolean = false;

    constructor(private activityService: UserActivityService,
        private translate: CustomTranslateService,
        public popupService: PopupService) { }

    ngOnInit() {
        if (this.type == 'delete_selection') {
            this.popupSubHeading = this.translate.instant('pwa.activity.page.delete.selection.popup.subheading');
            this.popupDesc = this.translate.instant('pwa.activity.page.delete.selection.popup.description');
            this.cancelBtnText = this.translate.instant('pwa.activity.page.delete.selection.popup.cancel.button.text');
            this.continueBtnText = this.translate.instant('pwa.activity.page.delete.selection.popup.continue.button.text');
        } else if (this.type == 'delete_download') {
            this.popupSubHeading = this.translate.instant('pwa.activity.page.delete.download.popup.subheading');
            this.popupDesc = this.translate.instant('pwa.activity.page.delete.download.popup.description');
            this.cancelBtnText = this.translate.instant('pwa.activity.page.delete.download.popup.cancel.button.text');
            this.continueBtnText = this.translate.instant('pwa.activity.page.delete.download.popup.continue.button.text');
        }
    }

    confirmDeleteSelection(): void {
        this.activityService.deleteSelection(this.selectionItem.id)
            .subscribe(
                resp => {
                    if (resp && resp.result == 'sel_delete_success') {

                        window.location.reload();
                    } else {
                        this.getErrorMessage(true);
                    }
                },
                error => {
                    this.getErrorMessage(true);
                });
    }

    confirmDeleteDownload(): void {
        this.activityService.deleteDownload(this.selectionItem.contentObj.id, this.selectionItem.contentObj.type)
            .subscribe(
                resp => {
                    if (resp && resp.result == 'song_delete_success') {
                        window.location.reload();
                    } else {
                        this.getErrorMessage(false);
                    }
                },
                error => {
                    this.getErrorMessage(false);
                });
    }

    private getErrorMessage(isSelection: boolean): void {
        this.deleteError = true;
        if (isSelection) {
            this.popupSubHeading = this.translate.instant('pwa.activity.page.delete.selection.failure.subheading');
            this.popupDesc = this.translate.instant('pwa.activity.page.delete.selection.failure.description');
            this.closeBtnText = this.translate.instant('pwa.activity.page.delete.selection.failure.close.btn.text');
        }
        else {
            this.popupSubHeading = this.translate.instant('pwa.activity.page.delete.download.failure.subheading');
            this.popupDesc = this.translate.instant('pwa.activity.page.delete.download.failure.description');
            this.closeBtnText = this.translate.instant('pwa.activity.page.delete.download.failure.close.btn.text');
        }

    }


}

