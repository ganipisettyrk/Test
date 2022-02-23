export class CustomWebWorker {

  getUserSelectionData(url: string, params: any, resultCT: string[]): Promise<any> {

    let urlWithParam = url + this.formatParams(params);

    return this.getUrlResponse(urlWithParam).then(
      (res: any) => {
        if (res && res.total_count) {
          let totalItemCountCT = res.total_count;
          resultCT = this.getUserSelection(resultCT, res.playrules);
          let offset = params.offset + params.maxItems;
          var updatedParams = {
            maxItems: params.maxSize,
            offset: offset
          }
          if (totalItemCountCT > offset) {
            return this.getUserSelectionData(url, updatedParams, resultCT);
          } else {
            return resultCT;
          }
        }
        else {
          return null;
        }
      },
      error => {
        return null;
      }
    );
  }

  getRTData(url: string, params: any, resultRT: string[]): Promise<string[]> {

    let urlWithParam = url + this.formatParams(params);

    return this.getUrlResponse(urlWithParam).then(
      (res: any) => {
        if (res && res.records) {
          let totalItemCountRT = res.total_item_count;
          resultRT = this.getRTSelections(resultRT, res.records);
          let offset = params.offset + params.maxItems;

          let updateParams = {
            maxItems: params.maxSize,
            offset: offset
          }

          if (totalItemCountRT > offset) {
            return this.getRTData(url, updateParams, resultRT);
          } else {
            return resultRT;
          }
        }
        else {
          return null;
        }
      },
      error => {
        return null;
      }
    );
  }

  getMyAccountDetails(url): Promise<any> {

    let result = { "userProfileObj": null, "catalog_subscription_id": null, "myAccountDetails": null };
    return this.getUrlResponse(url).then(
      (response: any) => {
        if (response && response.subscription) {
          let userProfileObj = {};
          let activePlan = response.subscription;
          userProfileObj['Subscription_status'] = activePlan.status;
          userProfileObj['User_bill_type'] = activePlan.subscriber_type;
          userProfileObj['User_Subscription_Plan'] = activePlan.catalog_subscription.name;
          userProfileObj['Last_charged_Price_Point'] = this.getPrice(activePlan.catalog_subscription.retail_price);
          userProfileObj['Last_charged_date'] = activePlan.last_billed_date;
          userProfileObj['Next_charging_date'] = activePlan.end_date;
          userProfileObj['Circle'] = activePlan.circle;
          userProfileObj['Operator'] = activePlan.operator;

          result.userProfileObj = userProfileObj;
          result.catalog_subscription_id = activePlan.catalog_subscription.id;;

          let myAccountDetails = {};
          myAccountDetails['Subscription_status'] = activePlan.status;
          myAccountDetails['price'] = activePlan.catalog_subscription.retail_price;
          myAccountDetails['period'] = activePlan.catalog_subscription.period;
          myAccountDetails['activePlan'] = activePlan.catalog_subscription.name;
          if (null != response.songs_list[0]) {
            myAccountDetails['songSelectionPrice'] = response.songs_list[0].purchase_price.retail_price;
          }
          myAccountDetails['nextSubscription'] = activePlan.end_date;
          myAccountDetails['lastSubscription'] = activePlan.start_date;
          result.myAccountDetails = myAccountDetails;
          return result;
        }
        else {
          return null;
        }
      },
      error => {
        return null;
      }
    );

  }

  getUserSubscriptionsDetails(url: string, isRTContent: boolean): Promise<any> {

    var params = {
      isRTContent: isRTContent,
    }
    let urlWithParam = url + this.formatParams(params);
    let result = { "rtUserProfileObj": null, "myRTAccountDetails": null, "catalog_subscription_id": null, rtUserStatus: null };
    return this.getUrlResponse(urlWithParam).then(
      (response: any) => {
        if (response && response[0]) {
          let activeRTPlan = response[0];
          let userProfileObj = {};
          userProfileObj['RT_Subscription_status'] = activeRTPlan.status;
          userProfileObj['RT_User_Subscription_Plan'] = activeRTPlan.class_of_service;
          if (activeRTPlan.catalog_subscription) {
            userProfileObj['RT_Last_charged_Price_Point'] = this.getPrice(activeRTPlan.catalog_subscription.retail_price);
          }
          userProfileObj['RT_Last_charged_date'] = activeRTPlan.start_date;
          userProfileObj['RT_Next_charging_date'] = activeRTPlan.end_date;
          userProfileObj['RT_Circle'] = activeRTPlan.circle;
          userProfileObj['RT_Operator'] = activeRTPlan.operator;
          if (activeRTPlan.credits) {
            userProfileObj['RT_total_downloads'] = activeRTPlan.credits.count;
            userProfileObj['RT_available_downloads'] = activeRTPlan.credits.available;
          }

          result.rtUserProfileObj = userProfileObj;
          result.catalog_subscription_id = activeRTPlan.catalog_subscription_id;
          result.rtUserStatus = activeRTPlan.status;

          let myAccountDetails = {};
          if (activeRTPlan.catalog_subscription) {
            myAccountDetails['price'] = activeRTPlan.catalog_subscription.retail_price;
            myAccountDetails['period'] = activeRTPlan.catalog_subscription.period;
          }
          myAccountDetails['activePlan'] = activeRTPlan.class_of_service;
          myAccountDetails['nextSubscription'] = activeRTPlan.end_date;
          myAccountDetails['lastSubscription'] = activeRTPlan.start_date;
          if (activeRTPlan.credits[0]) {
            myAccountDetails['count'] = activeRTPlan.credits[0].count;
            myAccountDetails['available_downloads'] = activeRTPlan.credits[0].available;
          }
          result.myRTAccountDetails = myAccountDetails;

          return result;
        }
        else {
          return null;
        }
      },
      error => {
        return null;
      }
    );

  }

  getUserInfo(url): Promise<any> {
    let result = { "userInfoObj": null };
    return this.getUrlResponse(url).then(
      (response: any) => {
        if (response) {
          let userInfoObj = {};
          userInfoObj['user_id'] = response.id;
          userInfoObj['user_status'] = response.status;
          userInfoObj['msisdn'] = response.msisdn;
          userInfoObj['user_type'] = response.user_type;
          userInfoObj['time_zone'] = response.time_zone;
          userInfoObj['network'] = response.network;
          userInfoObj['Circle'] = response.circle_name;
          userInfoObj['Operator'] = response.operator_name;
          userInfoObj['external_id'] = response.external_id;
          result.userInfoObj = userInfoObj;
          return result;
        }
        else {
          return null;
        }
      },
      error => {
        return null;
      }
    );

  }

  getBannerContent(url: string, params: any): Promise<any> {
    let items: any[] = params.bannerItemsRingback;
    let promises = [];
    for (let i = 0; i < items.length; i++) {
      let contentId = items[i].id;
      let contentType = items[i].type;
      let urlParams = {
        browsingLanguage: params.browsingLanguage,
        contentId: contentId,
        contentType: contentType,
        extMode: params.extMode,
        showAvailability: params.showAvailability
      };
      promises.push(this.getBannerContentResult(url, urlParams));
    }
    return Promise.all(promises)
      .then((results) => {
        return results;
      })
      .catch((e) => {
        return null;
      });
  }

  updateClevertapDataToVoltron(url, params): Promise<any> {
    let result = { "userId": null };
    let urlWithParam = url + this.formatParams(params);

    return this.getUrlResponse(urlWithParam).then(
      (response: any) => {
        if (response && response.user_id) {
          result.userId = response.user_id;
          return result;
        }
        else {
          return null;
        }
      },
      error => {
        return null;
      });
    
  }

  postPwaLaunch(url, params): Promise<any> {
    let result = { "userId": null };
    let urlWithParam = url + this.formatParams(params);

    return this.getUrlResponse(urlWithParam).then(
      (response: any) => {
        if (response && response.user_id) {
          result.userId = response.user_id;
          return result;
        }
        else {
          return null;
        }
      },
      error => {
        return null;
      });
    
  }

  private getBannerContentResult(url: string, params: any): Promise<any> {

    let urlWithParam = url + this.formatParams(params);
    return this.getUrlResponse(urlWithParam).then(
      (res: any) => {
        if (res && res.id) {
          return res;
        }
        else {
          return null;
        }
      },
      error => {
        return null;
      });
  }

  private getUrlResponse(url): Promise<any> {
    let prom = new Promise(function (resolve, reject) {
      if (!!XMLHttpRequest) {
        let xhttp = new XMLHttpRequest();
        xhttp.responseType = 'json';

        xhttp.timeout = 5000;

        xhttp.onload = function () {
          if (this.readyState == 4 && (this.status == 200)) {
            resolve(this.response);
          }
          reject({
            readyState: this.readyState,
            status: this.status
          });
        };

        xhttp.ontimeout = function () {
          reject({
            readyState: this.readyState,
            status: this.status
          });
        };

        xhttp.open("GET", url, true);
        xhttp.send();
      }
    });
    return prom;
  }

  private formatParams(params): string {
    return "?" + Object
      .keys(params)
      .map(function (key) {
        return key + "=" + encodeURIComponent(params[key])
      })
      .join("&");
  }

  private getPrice(retailPrice): string {
    let subsPrice = '';
    if (retailPrice && retailPrice.currency && retailPrice.amount) {
      subsPrice = retailPrice.currency + " " + retailPrice.amount;
    } else {
      // console.log('Either retail price/currency/amount not available');
    }
    return subsPrice;
  }

  private getUserSelection(ringbacks: string[], userSelections: any): string[] {

    let selectionsSize = userSelections.length;
    for (let i = 0; i < selectionsSize; i++) {
      let asset: any = userSelections[i].asset;
      ringbacks.push(asset.id);
    }
    return ringbacks;
  }

  private getRTSelections(realtones: string[], rtHistoryRecord: any): string[] {

    let recordSize = rtHistoryRecord.length;
    for (let i = 0; i < recordSize; i++) {
      if (rtHistoryRecord[i] && rtHistoryRecord[i].purchase_item_details
        && rtHistoryRecord[i].purchase_item_details.media_id) {
        let id = rtHistoryRecord[i].purchase_item_details.media_id;

        realtones.push(id);
      }
    }
    return realtones;
  }

}
