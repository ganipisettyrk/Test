import { Injectable } from '@angular/core';
import { forkJoin, Observable, Subject } from 'rxjs';
import { HttpRequestService } from './../utils/http-request.service';

@Injectable()
export class UserActivityService {

  private activityToggle = new Subject<string>();

  constructor(private httpService: HttpRequestService) { }


  getUserSelectionsHistory(maxItems, offset): Observable<any> {
    let params = [];
    params.push({ paramName: 'maxCount', paramValue: maxItems });
    params.push({ paramName: 'offset', paramValue: offset });

    return this.httpService.get('getdeactivatedtunes', params);
  }

  getListOfPurchasedContent(): Observable<any> {
    return this.httpService.get('listpurchasedrbtcontent')
  }

  getUserSelections(maxItems, offset): Observable<any> {
    let params = [];
    params.push({ paramName: 'maxItems', paramValue: maxItems });
    params.push({ paramName: 'offset', paramValue: offset });

    return this.httpService.get('getuserselections', params);
  }

  getDeactivatedTunesMetadata(songList: any[]): Observable<any> {
    let reqArray = [];

    let selectionsSize = songList.length;
    for (let i = 0; i < selectionsSize; i++) {
      let asset = songList[i];
      let assetType = "ringback";
      if (asset["type"] == "rbtstation") {
        assetType = "ringback_station";
      }
      let params = [];
      let browsingLanguage = localStorage.getItem("browsingLanguage");
      params.push({ paramName: 'contentId', paramValue: asset.id });
      params.push({ paramName: 'contentType', paramValue: assetType });
      params.push({ paramName: 'browsingLanguage', paramValue: browsingLanguage });
      let extMode = sessionStorage.getItem('EXTERNAL_MODE');
      params.push({ paramName: 'extMode', paramValue: extMode });
      params.push({ paramName: 'showAvailability', paramValue: false });
      reqArray.push(this.httpService.get('getcontent', params));
    }
    return forkJoin(reqArray);
  }

  getSubscribedContent(selections: any[]): Observable<any> {
    let reqArray = [];
    let playruleId: any[] = [];

    if (selections) {
      let selectionsSize = selections.length;
      for (let i = 0; i < selectionsSize; i++) {
        let asset = selections[i].asset;
        let assetType = "ringback";
        if (asset["type"] == "ringback_station" || asset["type"].toUpperCase() == 'RBTSTATION') {
          assetType = "ringback_station";
        }

        let params = [];
        let browsingLanguage = localStorage.getItem("browsingLanguage");
        params.push({ paramName: 'contentId', paramValue: asset.id });
        params.push({ paramName: 'contentType', paramValue: assetType });
        params.push({ paramName: 'browsingLanguage', paramValue: browsingLanguage });
        let extMode = sessionStorage.getItem('EXTERNAL_MODE');
        params.push({ paramName: 'extMode', paramValue: extMode });

        playruleId.push(asset ? asset.reference_id : null);
        params.push({ paramName: 'showAvailability', paramValue: false });

        reqArray.push(this.httpService.get('getcontent', params));
      }
      return forkJoin(reqArray);
    }
  }

  deleteSelection(playruleId: string): Observable<any> {
    let params = [];
    params.push({ paramName: 'playruleId', paramValue: playruleId });
    return this.httpService.get('deleteselection', params)
  }

  deleteDownload(contentId, contentType): Observable<any> {
    let params = [];
    params.push({ paramName: 'contentId', paramValue: contentId });
    params.push({ paramName: 'contentType', paramValue: contentType });

    return this.httpService.get('deletedownload', params);
  }

  setActivityToggle(value: string) {
    this.activityToggle.next(value);
  }

  getActivityToggle(): Observable<string> {
    return this.activityToggle.asObservable();
  }

  getRtPurchaseHistory(maxItems: number, offset: number): Observable<any> {
    let params = [];
    params.push({ paramName: 'maxItems', paramValue: maxItems });
    params.push({ paramName: 'offset', paramValue: offset });

    return this.httpService.get('getrtpurchasehistory', params);
  }

  getRtPurchaseHistoryContent(rtHistoryRecord: any[]): Observable<any> {
    let reqArray = [];
    if (rtHistoryRecord) {
      let recordSize = rtHistoryRecord.length;
      for (let i = 0; i < recordSize; i++) {
        if (rtHistoryRecord[i] && rtHistoryRecord[i].purchase_item_details
          && rtHistoryRecord[i].purchase_item_details.media_id) {
          let id = rtHistoryRecord[i].purchase_item_details.media_id;
          let browsingLanguage = localStorage.getItem("browsingLanguage");
          let params = [];
          params.push({ paramName: 'contentId', paramValue: id });
          params.push({ paramName: 'contentType', paramValue: "realtone" });
          params.push({ paramName: 'browsingLanguage', paramValue: browsingLanguage });
          let extMode = sessionStorage.getItem('EXTERNAL_MODE');
          params.push({ paramName: 'extMode', paramValue: extMode });
          params.push({ paramName: 'showAvailability', paramValue: false });
          reqArray.push(this.httpService.get('getcontent', params));
        }
      }

      return forkJoin(reqArray);
    }
  }

  unsubscribeService(subscriptionId): Observable<any> {
    let params = [];
    params.push({ paramName: 'subscriptionId', paramValue: subscriptionId})
    return this.httpService.get('unsubscribe', params);
  }

}
