/// <reference lib="webworker" />
import { CustomWebWorker } from "./utils/custom-web-worker";

addEventListener('message', ({ data }) => {
  let customWebWorker: CustomWebWorker = new CustomWebWorker();

  let resultObj = { "result": null, "type": null };
  let requestType: string = data.type;

  if (requestType == "selection") {
    let urlCT = "getuserselections";
    let params = data.params;
    customWebWorker.getUserSelectionData(urlCT, params, []).then(
      (res: any) => {
        if (null != res) {
          resultObj.result = res;
          resultObj.type = requestType;
        }
        postMessage(resultObj);
      });
  }
  else if (requestType == "rtHistory") {
    let params = data.params;
    let urlRT = "getrtpurchasehistory";
    customWebWorker.getRTData(urlRT, params, []).then(
      (res: any) => {
        if (null != res) {
          resultObj.result = res;
          resultObj.type = requestType;
        }
        postMessage(resultObj);
      });
  } else if (requestType == "myAccountInitial" || requestType == "myAccount") {
    let url = "getmyaccount";
    customWebWorker.getMyAccountDetails(url).then(
      (res: any) => {
        if (null != res) {
          resultObj.result = res;
          resultObj.type = requestType;
        }
        postMessage(resultObj);
      });
  } else if (requestType == "myAccountRTInitial" || requestType == "myAccountRT") {
    let url = "getusersubscription";
    customWebWorker.getUserSubscriptionsDetails(url, true).then(
      (res: any) => {
        if (null != res) {
          resultObj.result = res;
          resultObj.type = requestType;
        }
        postMessage(resultObj);
      });
  } else if (requestType == "userInfo") {
    let url = "getuserinfo";
    customWebWorker.getUserInfo(url).then(
      (res: any) => {
        if (null != res) {
          resultObj.result = res;
          resultObj.type = requestType;
        }
        postMessage(resultObj);
      });
  } else if (requestType == "bannerContent") {
    let url = "getbannercontent";
    let params = data.params;
    customWebWorker.getBannerContent(url, params).then(
      (res: any) => {
        if (null != res) {
          resultObj.result = res;
          resultObj.type = requestType;
        }
        postMessage(resultObj);
      });
  } else if (requestType == "clevertapUpdateVoltron") {
    let url = "postctdatatovoltron";
    let params = data.params;
    customWebWorker.updateClevertapDataToVoltron(url, params).then(
      (res: any) => {
        if (null != res) {
          resultObj.result = res;
          resultObj.type = requestType;
        }
        postMessage(resultObj);
      });
  }
  else if (requestType == "postPwaLaunch") {
    let url = "postpwalaunch";
    let params = data.params;
    customWebWorker.postPwaLaunch(url, params).then(
      (res: any) => {
        if (null != res) {
          resultObj.result = res;
          resultObj.type = requestType;
        }
        postMessage(resultObj);
      });
  }
  
}, {passive: true});
