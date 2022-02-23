import { Injectable } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Observable } from 'rxjs';
import { CommonService } from '../utils/common.service';
import { HttpRequestService } from '../utils/http-request.service';

@Injectable()
export class FeedbackService {

	constructor(private httpRequest: HttpRequestService,
		private deviceService: DeviceDetectorService, private commonService: CommonService) { }

	submitFeedback(formGroup): Observable<any> {

		let params = {
			'name': this.commonService.getSafeValue(formGroup.value.nameModel),
			'email': this.commonService.getSafeValue(formGroup.value.emailModel),
			'message': this.commonService.getSafeValue(formGroup.value.feedbackModel),
			'category': "MWeb",
			'oem': this.deviceService.getDeviceInfo().device,
			'model': this.deviceService.getDeviceInfo().device,
			'os_version': this.deviceService.getDeviceInfo().userAgent,
			'app_version': "PWA"
		};

		return this.httpRequest.post('submitfeedback', params);

	}
}
