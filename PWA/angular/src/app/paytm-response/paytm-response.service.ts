import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpRequestService } from '../utils/http-request.service';

@Injectable()
export class PaytmResponseService {

constructor(private httpService: HttpRequestService) { }

    getComboRespAfterPayment(uniqueId, contentId, extraInfo): Observable<any> {
        let params = {
            "uniqueId" : uniqueId,
            "contentId" : contentId,
            "extraInfo" : extraInfo
        };
        return this.httpService.post("getcomborespafterpayment", params);
    }
}
