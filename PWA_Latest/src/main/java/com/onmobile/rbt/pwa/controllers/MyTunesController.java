package com.onmobile.rbt.pwa.controllers;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mobile.device.Device;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.onmobile.rbt.pwa.services.MytunesService;
import com.onmobile.rbt.pwa.utils.StoreServerException;
import com.onmobile.rbt.pwa.utils.WebConstants;
import com.onmobile.rbt.pwa.utils.WebUtilsInterface;

@Controller
public class MyTunesController implements WebConstants {
	private static final Logger logger = LogManager.getLogger(MyTunesController.class);

	@Autowired
	MytunesService myTunesService;

	@Autowired
	WebUtilsInterface webUtils;

	@RequestMapping("getuserselections")
	@ResponseBody
	public String getUserSelections(@RequestParam(value = "maxItems", required = true) Integer maxItemsIntVal,
			@RequestParam(value = "offset", required = true) Integer offsetIntVal, HttpServletRequest request,
			HttpSession session, Device device) {

		logger.info("Inside getUserSelections()...");
		String maxItems = maxItemsIntVal.toString();
		String offset = offsetIntVal.toString();
		try {
			return myTunesService.getUserSelectionsResponse(request, session, maxItems, offset, device);
		} catch (StoreServerException e) {
			logger.error("Unable to get user selections", e);
			return webUtils.obtainJSONFromObject(webUtils.getPWAException(e));
		}

	}
	/*
	 * 
	 * @RequestMapping("/deleteSpecificCallerSettings")
	 * 
	 * @ResponseBody public String
	 * deleteSpecificCallerSettings(@RequestParam(required = true, value =
	 * "playruleId") String playruleId, HttpServletRequest request, HttpSession
	 * session, Device device) {
	 * 
	 * try { return
	 * myTunesService.getDeleteSpecificCallerSettingsResponse(playruleId, request,
	 * session, device); } catch (StoreServerException e) {
	 * logger.error("Unable delete specific caller from the settings", e); throw new
	 * PWAException(); } }
	 */

	@RequestMapping("/deleteselection")
	@ResponseBody
	public String deleteSelection(@RequestParam(required = false, value = "playruleId") String playruleId,
			HttpServletRequest request, HttpSession session, Device device) {

		try {
			return myTunesService.deleteSelection(playruleId, request, session, device);
		} catch (StoreServerException e) {
			logger.error("Unable to delete selections with playruleId: " + playruleId, e);
			return webUtils.obtainJSONFromObject(webUtils.getPWAException(e));
		}
	}

	@RequestMapping("/deletedownload")
	@ResponseBody
	public String deleteDownload(@RequestParam(required = true, value = "contentId") String contentId,
			@RequestParam(required = true, value = "contentType") String contentType, HttpServletRequest request,
			HttpSession session, Device device) {

		try {
			return myTunesService.deleteDownload(contentId, contentType, request, session, device);
		} catch (StoreServerException e) {
			logger.error("Unable to delete download for contentID: " + contentId + " of contentType: " + contentType,
					e);
			return webUtils.obtainJSONFromObject(webUtils.getPWAException(e));
		}
	}

	/*
	 * @RequestMapping("/setPlayrule")
	 * 
	 * @ResponseBody public String setPlayrule(@RequestParam(value = "id", required
	 * = true) String contentId,
	 * 
	 * @RequestParam(value = "caller", required = true) String caller,
	 * 
	 * @RequestParam(value = "type", required = true) String contentType,
	 * 
	 * @RequestParam(value = "artist", required = false) String artist,
	 * 
	 * @RequestParam(value = "genre", required = false) String genre,
	 * 
	 * @RequestParam(value = "status", required = false) String status,
	 * 
	 * @RequestParam(value = "subtype", required = false) String subtype,
	 * 
	 * @RequestParam(value = "title", required = false) String title,
	 * 
	 * @RequestParam(value = "lang", required = false) String lang,
	 * 
	 * @RequestParam(value = "expdate", required = false) String expdate,
	 * 
	 * @RequestParam(value = "validdate", required = false) String validdate,
	 * 
	 * @RequestParam(value = "contentkey", required = false) String contentkey,
	 * 
	 * @RequestParam(value = "preview", required = false) String preview,
	 * 
	 * @RequestParam(value = "price", required = false) String price,
	 * 
	 * @RequestParam(value = "renew", required = false) boolean renew,
	 * 
	 * @RequestParam(value = "autoRenew", required = false) boolean autoRenew,
	 * 
	 * @RequestParam(value = "renewPrice", required = false) String renewPrice,
	 * 
	 * @RequestParam(value = "playruleId", required = false) String playruleId,
	 * 
	 * @RequestParam(value = "profilePlayRange", required = false) String
	 * profilePlayRange, HttpServletRequest request, HttpSession session, Device
	 * device) {
	 * 
	 * try { return myTunesService.setPlayrule(contentId, caller, contentType,
	 * artist, genre, status, subtype, title, lang, expdate, validdate, contentkey,
	 * preview, price, renew, autoRenew, renewPrice, playruleId, profilePlayRange,
	 * request, session, device); } catch (StoreServerException e) {
	 * logger.error("Unable to set plarule for content" + contentId +
	 * " Error message", e); throw new PWAException();
	 * 
	 * } }
	 * 
	 */
	@RequestMapping("/getdeactivatedtunes")
	@ResponseBody
	public String getDeactivatedTunes(
			@RequestParam(value = "offset", required = false, defaultValue = "0") Integer offset,
			@RequestParam(value = "maxCount", required = false, defaultValue = "10") Integer maxCount,
			HttpServletRequest request, HttpSession session, Device device) {

		try {
			return myTunesService.getDeactivatedTunesResponse(offset, maxCount, request, session, device);
		} catch (StoreServerException e) {
			logger.error("Unble to get deactivatedtunes", e);
			return webUtils.obtainJSONFromObject(webUtils.getPWAException(e));
		}

	}

	@RequestMapping("listpurchasedrbtcontent")
	@ResponseBody
	public String listPurchasedRbtContent(HttpServletRequest request, HttpSession session, Device device) {

		try {
			return myTunesService.getListPurchasedRbtContentResponse(request, session, device);
		} catch (StoreServerException e) {
			logger.error("Unable to list purchased rbt content for msisdn:", e);
			return webUtils.obtainJSONFromObject(webUtils.getPWAException(e));
		}
	}

	@RequestMapping("getrtpurchasehistory")
	@ResponseBody
	public String getRTPurchaseHistory(@RequestParam(value = "maxItems", required = true) Integer maxItems,
			@RequestParam(value = "offset", required = true) Integer offset, HttpServletRequest request,
			HttpSession session, Device device) {
		try {
			return myTunesService.getRTPurchaseHistoryResponse(maxItems, offset, request, session, device);
		} catch (StoreServerException e) {

			logger.error("Unable to get RT purchase history for msisdn:", e);
			return webUtils.obtainJSONFromObject(webUtils.getPWAException(e));
		}
	}

	@RequestMapping("unsubscribe")
	@ResponseBody
	public String unsubscribeService(@RequestParam(value = "subscriptionId", required = true) String subscriptionId,
			HttpServletRequest request, HttpSession session, Device device) {

		try {
			return myTunesService.getUnSuscribeServiceResponse(subscriptionId, request, session, device);
		} catch (StoreServerException e) {
			logger.error("Error while unsubscribing service: ", e);
			return webUtils.obtainJSONFromObject(webUtils.getPWAException(e));
		}
	}
}
