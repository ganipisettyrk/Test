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
import com.onmobile.rbt.pwa.services.PurchaseService;
import com.onmobile.rbt.pwa.services.UtilityService;
import com.onmobile.rbt.pwa.utils.StoreServerException;
import com.onmobile.rbt.pwa.utils.WebConstants;
import com.onmobile.rbt.pwa.utils.WebUtilsInterface;

@Controller
public class MyTunesController implements WebConstants {
	private static final Logger logger = LogManager.getLogger(MyTunesController.class);

	@Autowired
	MytunesService myTunesService;

	@Autowired
	PurchaseService purchaseService;

	@Autowired
	UtilityService utilService;

	@Autowired
	WebUtilsInterface webUtils;

	@RequestMapping("getuserselections")
	@ResponseBody
	public String getUserSelections(@RequestParam(value = "maxItems", required = true) String maxItems,
			@RequestParam(value = "offset", required = true) String offset, HttpServletRequest request,
			HttpSession session, Device device) {

		String userSelections = null;
		String token = null;

		logger.info("Inside getUserSelections()...");

		String msisdn = utilService.getMsisdn(request, device);
		String storeId = utilService.getStoreId(request, session, device);

		if (null != storeId) {
			try {
				token = utilService.getAuthenticationToken(session, msisdn, storeId);
				userSelections = myTunesService.getUserSelections(request, session, maxItems, offset, token, storeId);
			} catch (StoreServerException e) {
				if (AUTH_TOKEN_EXPIRED.equalsIgnoreCase(e.getCode())) {
					logger.info(
							"Token expired while getting user selections, so generating token and hitting the url...");
					try {
						token = utilService.getNewAuthenticationToken(session, msisdn, storeId);
						userSelections = myTunesService.getUserSelections(request, session, maxItems, offset, token,
								storeId);
					} catch (StoreServerException ex) {
						String msg = webUtils.obtainJSONFromObject(ex);
						logger.error("Unble to get user selections for MSISDN : " + msisdn + " error msg:" + msg);
						return msg;
					}
				} else {
					String msg = webUtils.obtainJSONFromObject(e);
					logger.error("Unble to list subscriptions for MSISDN : " + msisdn + " error msg:" + msg);
					return msg;
				}
			}
		}
		return userSelections;
	}

	@RequestMapping("/deleteSpecificCallerSettings")
	@ResponseBody
	public String deleteSpecificCallerSettings(@RequestParam(required = true, value = "playruleId") String playruleId,
			HttpServletRequest request, HttpSession session, Device device) {

		try {
			return myTunesService.deleteSpecificCallerSettings(playruleId, request, session, device);
		} catch (StoreServerException e) {
			String msg = webUtils.obtainJSONFromObject(e);
			logger.error("Unable specific caller from the settings, error msg:	" + msg);
			return msg;
		}
	}

	@RequestMapping("/deleteselection")
	@ResponseBody
	public String deleteSelection(@RequestParam(required = false, value = "playruleId") String playruleId,
			HttpServletRequest request, HttpSession session, Device device) {

		try {
			return myTunesService.deleteSelection(playruleId, request, session, device);
		} catch (StoreServerException e) {
			logger.error("Unable to delete selections with playruleId: " + playruleId);
			return webUtils.obtainJSONFromObject(e);
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
			logger.error("Unable to delete download for contentID: " + contentId + " of contentType: " + contentType);
			return webUtils.obtainJSONFromObject(e);
		}
	}

	/**
	 * This method will be called in case when the user initiates the purchase by
	 * clicking on edit from set for none section.
	 */

	@RequestMapping("/setPlayrule")
	@ResponseBody
	public String setPlayrule(@RequestParam(value = "id", required = true) String contentId,
			@RequestParam(value = "caller", required = true) String caller,
			@RequestParam(value = "type", required = true) String contentType,
			@RequestParam(value = "artist", required = false) String artist,
			@RequestParam(value = "genre", required = false) String genre,
			@RequestParam(value = "status", required = false) String status,
			@RequestParam(value = "subtype", required = false) String subtype,
			@RequestParam(value = "title", required = false) String title,
			@RequestParam(value = "lang", required = false) String lang,
			@RequestParam(value = "expdate", required = false) String expdate,
			@RequestParam(value = "validdate", required = false) String validdate,
			@RequestParam(value = "contentkey", required = false) String contentkey,
			@RequestParam(value = "preview", required = false) String preview,
			@RequestParam(value = "price", required = false) String price,
			@RequestParam(value = "renew", required = false) boolean renew,
			@RequestParam(value = "autoRenew", required = false) boolean autoRenew,
			@RequestParam(value = "renewPrice", required = false) String renewPrice,
			@RequestParam(value = "playruleId", required = false) String playruleId,
			@RequestParam(value = "profilePlayRange", required = false) String profilePlayRange,
			HttpServletRequest request, HttpSession session, Device device) {

		try {
			return myTunesService.setPlayrule(contentId, caller, contentType, artist, genre, status, subtype, title,
					lang, expdate, validdate, contentkey, preview, price, renew, autoRenew, renewPrice, playruleId,
					profilePlayRange, request, session, device);
		} catch (StoreServerException e) {
			logger.error("Unable to inistaiate purchase for content" + contentId);
			return webUtils.obtainJSONFromObject(e);
		}
	}

	@RequestMapping("/getdeactivatedtunes")
	@ResponseBody
	public String getDeactivatedTunes(
			@RequestParam(value = "offset", required = false, defaultValue = "0") Integer offset,
			@RequestParam(value = "maxCount", required = false, defaultValue = "10") Integer maxCount,
			HttpServletRequest request, HttpSession session, Device device) {

		logger.info("Inside getDeactivatedTunes()...");

		String msisdn = utilService.getMsisdn(request, device);
		String storeId = utilService.getStoreId(request, session, device);

		String msisdnToken = null;
		String deactTunes = null;
		try {
			msisdnToken = utilService.getAuthenticationToken(session, msisdn, storeId);
			deactTunes = myTunesService.getDeactivatedTunes(request, session, msisdnToken, storeId, offset, maxCount);
		} catch (StoreServerException e) {

			if (AUTH_TOKEN_EXPIRED.equalsIgnoreCase(e.getCode())) {
				logger.info("Token expired while getListSubscriptions, so generating token and hitting the url...");
				try {
					msisdnToken = utilService.getNewAuthenticationToken(session, msisdn, storeId);
					deactTunes = myTunesService.getDeactivatedTunes(request, session, msisdnToken, storeId, offset,
							maxCount);
				} catch (StoreServerException ex) {
					String msg = webUtils.obtainJSONFromObject(ex);
					logger.error("Unble to get deact songs for MSISDN : " + msisdn + " error msg:" + msg);
					return msg;
				}
			} else {
				String msg = webUtils.obtainJSONFromObject(e);
				logger.error("Unble to get deact songs for MSISDN : " + msisdn + " error msg:" + msg);
				return msg;
			}
		}
		return deactTunes;
	}

	@RequestMapping("listpurchasedrbtcontent")
	@ResponseBody
	public String listPurchasedRbtContent(HttpServletRequest request, HttpSession session, Device device) {
		logger.info("Inside listPurchasedRbtContent()...");
		String msisdn = utilService.getMsisdn(request, device);
		String storeId = utilService.getStoreId(request, session, device);

		String msisdnToken = null;
		logger.info("Going to list purchased rbt content for MSISDN:" + msisdn);

		try {
			msisdnToken = utilService.getAuthenticationToken(session, msisdn, storeId);
			return myTunesService.listPurchasedRbtContent(msisdnToken, request, session, device);
		} catch (StoreServerException e) {

			if (WebConstants.AUTH_TOKEN_EXPIRED.equalsIgnoreCase(e.getCode())) {
				logger.info(
						"Token expired while listing purchasedRbtContent, so generating token and hitting the url...");
				try {
					msisdnToken = utilService.getNewAuthenticationToken(session, msisdn, storeId);
					return myTunesService.listPurchasedRbtContent(msisdnToken, request, session, device);
				} catch (StoreServerException ex) {
					String msg = webUtils.obtainJSONFromObject(ex);
					logger.error(
							"Unable to list purchased rbt content for msisdn:" + msisdn + ", Excetion message:" + msg);
					return msg;
				}
			} else {
				String msg = webUtils.obtainJSONFromObject(e);
				logger.error("Unable to list purchased rbt content for msisdn:" + msisdn + " Excetion message:" + msg);
				return msg;
			}
		}
	}

	@RequestMapping("getrtpurchashistory")
	@ResponseBody
	public String getRTPurchasHistory(@RequestParam(value = "maxItems", required = true) String maxItems,
			@RequestParam(value = "offset", required = true) String offset, HttpServletRequest request,
			HttpSession session, Device device) {
		logger.info("Inside getRTPurchasHistory()...");
		String msisdn = utilService.getMsisdn(request, device);
		String storeId = utilService.getStoreId(request, session, device);
		String msisdnToken = null;

		logger.info("Going to RT purchase history for MSISDN:" + msisdn);

		try {
			msisdnToken = utilService.getAuthenticationToken(session, msisdn, storeId);
			return myTunesService.getRTPurchasHistory(msisdnToken, maxItems, offset, request, session, device);
		} catch (StoreServerException e) {

			if (WebConstants.AUTH_TOKEN_EXPIRED.equalsIgnoreCase(e.getCode())) {
				logger.info(
						"Token expired while getting RT purchase history, so generating token and hitting the url...");
				try {
					msisdnToken = utilService.getNewAuthenticationToken(session, msisdn, storeId);
					return myTunesService.getRTPurchasHistory(msisdnToken, maxItems, offset, request, session, device);
				} catch (StoreServerException ex) {
					String msg = webUtils.obtainJSONFromObject(ex);
					logger.error(
							"Unable to get RT purchase history for msisdn:" + msisdn + ", Excetion message:" + msg);
					return msg;
				}
			} else {
				String msg = webUtils.obtainJSONFromObject(e);
				logger.error("Unable to get RT purchase history for msisdn:" + msisdn + " Excetion message:" + msg);
				return msg;
			}
		}
	}

	@RequestMapping("unsubscribe")
	@ResponseBody
	public String unsubscribeService(
			@RequestParam(value = "subscriptionId", required = true) String subscriptionId,
			HttpServletRequest request, HttpSession session, Device device) {
		logger.info("Inside unsubscribeService()...");
		String msisdn = utilService.getMsisdn(request, device);
		String storeId = utilService.getStoreId(request, session, device);
		
		String token = null;
		try {
			token = utilService.getAuthenticationToken(session, msisdn, storeId);
			return myTunesService.unsubscribeService(token, storeId, subscriptionId,
					request, session, device);
		} catch (StoreServerException e) {
			if (WebConstants.AUTH_TOKEN_EXPIRED.equalsIgnoreCase(e.getCode())) {
				logger.info("Token expired while trying to unsubscribe, so generating token and hitting the url...");
				try {
					token = utilService.getNewAuthenticationToken(session, msisdn, storeId);
					return myTunesService.unsubscribeService(token, storeId, subscriptionId,
							request, session, device);
				} catch (StoreServerException e1) {
					String msg = webUtils.obtainJSONFromObject(e1);
					logger.error("Error while unsubscribing service: " + e1.getMessage(), e1);
					return msg;
				}
			} else {
				String msg = webUtils.obtainJSONFromObject(e);
				logger.error("Error while unsubscribing service: " + e.getMessage(), e);
				return msg;
			}
		}
	}		
}
