package com.onmobile.rbt.pwa.services;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.mobile.device.Device;
import org.springframework.stereotype.Service;

import com.onmobile.rbt.pwa.utils.ApplicationResourceInterface;
import com.onmobile.rbt.pwa.utils.ResponseWrapper;
import com.onmobile.rbt.pwa.utils.StoreServerException;
import com.onmobile.rbt.pwa.utils.VoltronInterface;
import com.onmobile.rbt.pwa.utils.WebConstants;
import com.onmobile.rbt.pwa.utils.WebUtilsInterface;
import com.onmobile.store.storefront.dto.user.Subscription;

@Service
public class MytunesService implements WebConstants {

	private static final Logger logger = LogManager.getLogger(MytunesService.class);

	@Autowired
	UtilityService utilService;
	@Autowired
	ApplicationResourceInterface applicationResource;

	@Autowired
	WebUtilsInterface webUtils;

	@Autowired
	VoltronInterface voltronInterface;

	public String getUserSelectionsResponse(HttpServletRequest request, HttpSession session, String maxItems,
			String offset, Device device) throws StoreServerException {

		String token = null;
		String userSelections = null;

		String msisdn = utilService.getMsisdn(request, device);
		String storeId = utilService.getStoreId(request, session, device);

		if (null != storeId && null != msisdn) {
			try {
				token = utilService.getAuthenticationToken(session, msisdn, storeId);
				userSelections = getUserSelections(request, session, maxItems, offset, token, storeId);
			} catch (StoreServerException e) {
				if (AUTH_TOKEN_EXPIRED.equalsIgnoreCase(e.getCode())) {
					logger.info(
							"Token expired while getting user selections, so generating token and hitting the url...");
					try {
						token = utilService.getNewAuthenticationToken(session, msisdn, storeId);
						userSelections = getUserSelections(request, session, maxItems, offset, token, storeId);
					} catch (StoreServerException ex) {
						throw e;
					}
				} else {
					throw e;
				}
			}
		}

		return userSelections;

	}

	public String getUserSelections(HttpServletRequest request, HttpSession session, String maxItems, String offset,
			String token, String storeId) throws StoreServerException {
		String url = applicationResource.getParameter(session, "pwa.list.playrules.url");

		url = url.replace("%STORE_ID%", storeId);
		url = url.replace("%CRED_TOKEN%", token);
		url = url.replace("%MAX_ITEMS%", maxItems);
		url = url.replace("%OFFSET%", offset);
		url = webUtils.getUpdatedVoltronUrl(session, url);

		logger.info("Hitting Voltron API to get user selections, URL: " + url);

		String userSelections = null;
		try {
			userSelections = voltronInterface.hitVoltronAPI(session, url, REQUEST_GET, null, String.class);
		} catch (StoreServerException storeException) {
			throw storeException;
		}
		logger.info("User selections list response : " + userSelections);
		return userSelections;
	}

	/**
	 * This method will be used to delete either all caller selection or specific
	 * caller selection
	 * 
	 * @throws StoreServerException
	 */
	public String deleteSelection(String playruleId, HttpServletRequest request, HttpSession session, Device device)
			throws StoreServerException {
		logger.info("Inside MyTunesService, deleteSelection()...");

		String storeId = utilService.getStoreId(request, session, device);

		String msisdn = utilService.getMsisdn(request, device);

		HttpStatus deleteStatus = null;
		String credToken = null;
		try {
			credToken = utilService.getAuthenticationToken(session, msisdn, storeId);
			deleteStatus = deleteSelection(session, playruleId, storeId, credToken);
		} catch (StoreServerException ex) {
			if (AUTH_TOKEN_EXPIRED.equalsIgnoreCase(ex.getCode())) {
				logger.info("Token expired while delete selection, so generating token and hitting the url...");
				credToken = utilService.getNewAuthenticationToken(session, msisdn, storeId);
				deleteStatus = deleteSelection(session, playruleId, storeId, credToken);
			} else {
				throw ex;
			}
		}
		logger.info("Delete selection status: " + deleteStatus.name());

		ResponseWrapper responseWrapper = new ResponseWrapper();
		if (deleteStatus == HttpStatus.OK) {
			logger.info("Selection successfully deleted with playruleId: " + playruleId);
			responseWrapper.setResult(SEL_DELETE_SUCCESS);
			responseWrapper.setStatusCode(deleteStatus.value());
		} else {
			logger.info("Unable to delete selection with playruleId: " + playruleId);
			responseWrapper.setResult(SEL_DELETE_FAILURE);
			responseWrapper.setStatusCode(deleteStatus.value());
		}

		String response = webUtils.obtainJSONFromObject(responseWrapper);
		return response;
	}

	private HttpStatus deleteSelection(HttpSession session, String playruleId, String storeId, String credToken)
			throws StoreServerException {

		HttpStatus deleteStatus = null;
		String url = applicationResource.getParameter(session, "pwa.delete.selection.url");
		url = url.replace("%PLAYRULE_ID%", playruleId);
		url = url.replace("%STORE_ID%", storeId);
		// deleteSelectionUrl = deleteSelectionUrl.replace("%ASSET_ID%", contentId);
		url = url.replace("%CRED_TOKEN%", credToken);
		url = webUtils.getUpdatedVoltronUrl(session, url);

		// deleteSelectionUrl = deleteSelectionUrl.replace("%ITEM_TYPE%", contentType);
		logger.info("Going to hit the delete specific caller url: " + url);

		deleteStatus = voltronInterface.getStatusCodeFromVoltronAPI(session, url, HttpMethod.DELETE, null,
				String.class);

		return deleteStatus;
	}


	public String getDeleteSpecificCallerSettingsResponse(String playruleId, HttpServletRequest request, HttpSession session,
			Device device) throws StoreServerException {

		logger.info("Inside MyTunesService, deleteSpecificCallerSettings()...");
		// http://localhost:8082/store/v2/ringback/subs/playrules/{playrule-id}?cred.token={cred.token}
		// We need to pass the method as DELETE

		String storeId = utilService.getStoreId(request, session, device);
		String msisdn = utilService.getMsisdn(request, device);

		HttpStatus deleteStatus = null;
		String credToken = null;
		try {
			credToken = utilService.getAuthenticationToken(session, msisdn, storeId);
			deleteStatus = deleteSpecificCallerSettingsResponse(session, playruleId, storeId, credToken);
		} catch (StoreServerException ex) {
			if (AUTH_TOKEN_EXPIRED.equalsIgnoreCase(ex.getCode())) {
				logger.info(
						"Token expired while deleting specific caller setting, so generating token and hitting the url...");
				credToken = utilService.getNewAuthenticationToken(session, msisdn, storeId);
				deleteStatus = deleteSpecificCallerSettingsResponse(session, playruleId, storeId, credToken);
			} else {
				throw ex;
			}
		}
		logger.info("Delete specific caller selecction status: " + deleteStatus.name());
		return deleteStatus.name();
	}

	private HttpStatus deleteSpecificCallerSettingsResponse(HttpSession session, String playruleId, String storeId,
			String credToken) throws StoreServerException {

		HttpStatus deleteStatus = null;
		String url = applicationResource.getParameter(session, "pwa.config.specific.caller.delete.url");
		url = url.replace("%PLAYRULE_ID%", playruleId);
		url = url.replace("%CRED_TOKEN%", credToken);
		url = url.replace("%STORE_ID%", storeId);
		url = webUtils.getUpdatedVoltronUrl(session, url);

		logger.info("Going to hit the delete specific caller url: " + url);

		deleteStatus = voltronInterface.getStatusCodeFromVoltronAPI(session, url, HttpMethod.DELETE, null,
				String.class);

		return deleteStatus;
	}

	/**
	 * This method will be used to delete subscriber downloads
	 * 
	 * @throws StoreServerException
	 */
	public String deleteDownload(String contentId, String contentType, HttpServletRequest request, HttpSession session,
			Device device) throws StoreServerException {
		logger.info("Inside MyTunesService, deleteDownload()...");

		// http://localhost:8082/store/v2/ringback/subs/songs/{song-id}?store_id={store-id}&cred.token={cred.token}&item_type={item-type}
		// We need to pass the method as DELETE
		String storeId = utilService.getStoreId(request, session, device);

		String msisdn = utilService.getMsisdn(request, device);

		HttpStatus deleteStatus = null;
		String credToken = null;
		try {
			credToken = utilService.getAuthenticationToken(session, msisdn, storeId);
			deleteStatus = deleteDownload(session, contentId, contentType, storeId, credToken);
		} catch (StoreServerException ex) {
			if (AUTH_TOKEN_EXPIRED.equalsIgnoreCase(ex.getCode())) {
				logger.info("Token expired while deleting download , so generating token and hitting the url...");
				credToken = utilService.getNewAuthenticationToken(session, msisdn, storeId);
				deleteStatus = deleteDownload(session, contentId, contentType, storeId, credToken);
			} else {
				throw ex;
			}
		}

		ResponseWrapper responseWrapper = new ResponseWrapper();
		if (deleteStatus == HttpStatus.OK) {
			logger.info("Download successfully deleted with cotnentId: " + contentId);
			responseWrapper.setResult(SONG_DELETE_SUCCESS);
			responseWrapper.setStatusCode(deleteStatus.value());
		} else {
			logger.info("Unable to delete download with contentId: " + contentId);
			responseWrapper.setResult(SONG_DELETE_FAILURE);
			responseWrapper.setStatusCode(deleteStatus.value());
		}

		String response = webUtils.obtainJSONFromObject(responseWrapper);
		return response;
	}

	private HttpStatus deleteDownload(HttpSession session, String contentId, String contentType, String storeId,
			String credToken) throws StoreServerException {
		HttpStatus deleteStatus = null;
		String url = applicationResource.getParameter(session, "pwa.delete.download.url");

		url = url.replace("%STORE_ID%", storeId);
		url = url.replace("%ASSET_ID%", contentId);
		url = url.replace("%CRED_TOKEN%", credToken);
		url = url.replace("%ITEM_TYPE%", contentType);
		url = webUtils.getUpdatedVoltronUrl(session, url);

		logger.info("Going to hit the delete download url: " + url);

		deleteStatus = voltronInterface.getStatusCodeFromVoltronAPI(session, url, HttpMethod.DELETE, null,
				String.class);
		return deleteStatus;
	}
	
	/*

	public String setPlayrule(String contentId, String caller, String contentType, String artist, String genre,
			String status, String subtype, String title, String lang, String expdate, String validdate,
			String contentkey, String preview, String price, boolean renew, boolean autoRenew, String renewPrice,
			String playruleId, String profilePlayRange, HttpServletRequest request, HttpSession session, Device device)
			throws StoreServerException {

		logger.info("Inside MyTunesService, setPlayrule()...");

		String msisdn = utilService.getMsisdn(request, device);
		if (!"DEFAULT".equalsIgnoreCase(caller) && msisdn.equals(caller)) {
			logger.info("User etnered his own number while editing the current setting, not continuing further...");
			StoreServerException storeException = new StoreServerException();
			storeException
					.setDescription(applicationResource.getParameter(session, "pwa.error.label.own.number.error"));
			throw storeException;
		}
		logger.info("msisdn retrieved from session is: " + msisdn);
		String storeId = utilService.getStoreId(request, session, device);

		Asset asset = null;
		if ("ringback".equalsIgnoreCase(contentType)) {
			Song song = new Song();
			song.setArtist(artist);
			song.setAutoRenew(autoRenew);
			song.setContentkey(contentkey);
			song.setExpdate(expdate);
			song.setGenre(genre);
			song.setId(Long.parseLong(contentId));
			song.setLang(lang);
			song.setPreview(preview);
			song.setPrice(price);
			song.setRenewPrice(renewPrice);
			song.setStatus(song.getStatus());
			song.setTitle(title);
			song.setValiddate(validdate);
			AssetSubType assetSubType = new AssetSubType();
			if ("ringback_azan".equalsIgnoreCase(subtype)) {
				assetSubType.setType(Asset.subtype.RINGBACK_AZAN);
			} else if ("ringback_dua".equalsIgnoreCase(subtype)) {
				assetSubType.setType(Asset.subtype.RINGBACK_DUA);
			} else if ("ringback_copitic".equalsIgnoreCase(subtype)) {
				assetSubType.setType(Asset.subtype.RINGBACK_COPITIC);
			} else {
				assetSubType.setType(Asset.subtype.RINGBACK_MUSICTUNE);
			}
			song.setSubtype(assetSubType);
			asset = song;
		} else if ("ringback_station".equalsIgnoreCase(contentType)) {
			RBTStation rbtStation = new RBTStation();
			rbtStation.setId(Long.parseLong(contentId));
			rbtStation.setType(AssetType.RBTSTATION);
			AssetSubType assetSubType = new AssetSubType();
			if ("ringback_azan".equalsIgnoreCase(subtype)) {
				assetSubType.setType(Asset.subtype.RINGBACK_AZAN);
			} else if ("ringback_dua".equalsIgnoreCase(subtype)) {
				assetSubType.setType(Asset.subtype.RINGBACK_DUA);
			} else if ("ringback_copitic".equalsIgnoreCase(subtype)) {
				assetSubType.setType(Asset.subtype.RINGBACK_COPITIC);
			} else {
				assetSubType.setType(Asset.subtype.RINGBACK_MUSICTUNE);
			}
			rbtStation.setSubtype(assetSubType);
			asset = rbtStation;
		}

		ScheduleWrapperBean schedule = new ScheduleWrapperBean();
		if (!(("ringback".equalsIgnoreCase(contentType)) && "ringback_profile".equalsIgnoreCase(subtype))) {
			schedule.setType(ScheduleType.DEFAULT);
			schedule.setId(1);
		} else {
			schedule.setType(ScheduleType.PLAYRANGE);
			schedule.setId(1);
			schedule.setPlayDuration(profilePlayRange);
			AssetSubType assetSubType = new AssetSubType();
			assetSubType.setType(Asset.subtype.RINGBACK_PROFILE);
			if (null != asset) {
				asset.setSubtype(assetSubType);
			}
		}

		CallingParty callingParty = new CallingParty();
		if ("DEFAULT".equalsIgnoreCase(caller)) {
			logger.info("User opted to set song for all caller...");
			callingParty.setType(CallingPartyType.DEFAULT);
		} else {
			logger.info("User opted to set song for special caller: " + caller);
			callingParty.setType(CallingPartyType.CALLER);
			callingParty.setId(Long.parseLong(caller));
		}

		PlayRuleWrapper playrule = new PlayRuleWrapper();
		playrule.setSchedule(schedule);
		playrule.setCallingparty(callingParty);
		playrule.setAsset(asset);
		playrule.setReverse(false);

		String playruleJson = webUtils.obtainJSONFromObject(playrule);
		logger.info("playruleJson: " + playruleJson);

		String setPlayruleApiResp = null;
		String token = null;

		try {
			token = utilService.getAuthenticationToken(session, msisdn, storeId);
			setPlayruleApiResp = setPlayRule(session, playrule, storeId, token);
		} catch (StoreServerException ex) {

			if (AUTH_TOKEN_EXPIRED.equalsIgnoreCase(ex.getCode())) {
				logger.info("Token expired while set playrule, so generating token and hitting the url...");
				token = utilService.getNewAuthenticationToken(session, msisdn, storeId);
				setPlayruleApiResp = setPlayRule(session, playrule, storeId, token);
			} else {
				throw ex;
			}
		}
		return setPlayruleApiResp;
	}
	

	private String setPlayRule(HttpSession session, PlayRuleWrapper playrule, String storeId, String token)
			throws StoreServerException {
		String url = applicationResource.getParameter(session, "pwa.config.playrule.set.url");

		url = url.replace("%STORE_ID%", storeId);
		url = url.replace("%CRED_TOKEN%", token);
		url = webUtils.getUpdatedVoltronUrl(session, url);

		logger.info("Going to hit set playrule url: " + url);

		String setPlayruleApiResp = null;
		setPlayruleApiResp = voltronInterface.hitVoltronAPI(session, url, REQUEST_POST, playrule, String.class);
		logger.info("Set playrule API response from url: " + url + " is: " + setPlayruleApiResp);

		return setPlayruleApiResp;
	}
	*/

	public String getDeactivatedTunesResponse(Integer offset, Integer maxCount, HttpServletRequest request,
			HttpSession session, Device device) throws StoreServerException {

		logger.info("Inside getDeactivatedTunes()...");

		String msisdn = utilService.getMsisdn(request, device);
		String storeId = utilService.getStoreId(request, session, device);

		String msisdnToken = null;
		try {
			msisdnToken = utilService.getAuthenticationToken(session, msisdn, storeId);
			return getDeactivatedTunes(request, session, msisdnToken, storeId, offset, maxCount);
		} catch (StoreServerException e) {

			if (AUTH_TOKEN_EXPIRED.equalsIgnoreCase(e.getCode())) {
				logger.info("Token expired while getListSubscriptions, so generating token and hitting the url...");
				try {
					msisdnToken = utilService.getNewAuthenticationToken(session, msisdn, storeId);
					return getDeactivatedTunes(request, session, msisdnToken, storeId, offset, maxCount);
				} catch (StoreServerException ex) {
					logger.error("Unble to get deact songs for MSISDN : " + msisdn);
					throw ex;
				}
			} else {
				logger.error("Unble to get deact songs for MSISDN : " + msisdn);
				throw e;
			}
		}

	}

	private String getDeactivatedTunes(HttpServletRequest request, HttpSession session, String token, String storeId,
			int offset, int maxCount) throws StoreServerException {
		String url = applicationResource.getParameter(session, "pwa.get.deactivated.songs.url");
		url = url.replace("%STORE_ID%", storeId);
		url = url.replace("%CRED_TOKEN%", token);
		url = url.replace("%OFFSET%", offset + "");
		url = url.replace("%MAX_COUNT%", maxCount + "");
		url = webUtils.getUpdatedVoltronUrl(session, url);

		logger.info("Going to hit set deact tunes url: " + url);

		String deactTunesResp = null;
		try {
			deactTunesResp = voltronInterface.hitVoltronAPI(session, url, REQUEST_GET, null, String.class);
		} catch (StoreServerException storeException) {
			throw storeException;
		}
		logger.info("get deact tunes API response from url: " + url + " is: " + deactTunesResp);
		return deactTunesResp;
	}

	public String getListPurchasedRbtContentResponse(HttpServletRequest request, HttpSession session, Device device)
			throws StoreServerException {

		logger.info("Inside listPurchasedRbtContent()...");
		String msisdn = utilService.getMsisdn(request, device);
		String storeId = utilService.getStoreId(request, session, device);

		String msisdnToken = null;
		logger.info("Going to list purchased rbt content for MSISDN:" + msisdn);

		try {
			msisdnToken = utilService.getAuthenticationToken(session, msisdn, storeId);
			return listPurchasedRbtContent(msisdnToken, request, session, device);
		} catch (StoreServerException e) {

			if (WebConstants.AUTH_TOKEN_EXPIRED.equalsIgnoreCase(e.getCode())) {
				logger.info(
						"Token expired while listing purchasedRbtContent, so generating token and hitting the url...");
				try {
					msisdnToken = utilService.getNewAuthenticationToken(session, msisdn, storeId);
					return listPurchasedRbtContent(msisdnToken, request, session, device);
				} catch (StoreServerException ex) {
					logger.error("Unable to list purchased rbt content for msisdn:" + msisdn);
					throw ex;
				}
			} else {
				logger.error("Unable to list purchased rbt content for msisdn:" + msisdn);
				throw e;
			}
		}

	}

	private String listPurchasedRbtContent(String msisdnToken, HttpServletRequest request, HttpSession session,
			Device device) throws StoreServerException {
		String listSubscriptionsUrl = applicationResource.getParameter(session, "pwa.list.purchased.content.url");
		String storeId = utilService.getStoreId(request, session, device);

		listSubscriptionsUrl = listSubscriptionsUrl.replace("%CRED_TOKEN%", msisdnToken);
		listSubscriptionsUrl = listSubscriptionsUrl.replace("%STORE_ID%", storeId);
		listSubscriptionsUrl = webUtils.getUpdatedVoltronUrl(session, listSubscriptionsUrl);

		logger.info("Listing purchased RBT content with url: " + listSubscriptionsUrl);

		String purchasedContent = null;
		try {
			purchasedContent = voltronInterface.hitVoltronAPI(session, listSubscriptionsUrl, WebConstants.REQUEST_GET,
					null, String.class);
		} catch (StoreServerException e) {
			logger.error("Something went wrong while getting purchased content: " + e.getMessage(), e);
			throw e;
		}
		logger.info("listPurchasedRbtContent response: " + purchasedContent);
		return purchasedContent;
	}

	public String getRTPurchaseHistoryResponse(Integer maxItems, Integer offset, HttpServletRequest request,
			HttpSession session, Device device) throws StoreServerException {
		logger.info("Inside getRTPurchaseHistory()...");

		String msisdn = utilService.getMsisdn(request, device);
		String storeId = utilService.getStoreId(request, session, device);
		String msisdnToken = null;

		logger.info("Going to RT purchase history for MSISDN:" + msisdn);

		try {
			msisdnToken = utilService.getAuthenticationToken(session, msisdn, storeId);
			return getRTPurchaseHistory(msisdnToken, maxItems.toString(), offset.toString(), request, session, device);
		} catch (StoreServerException e) {

			if (WebConstants.AUTH_TOKEN_EXPIRED.equalsIgnoreCase(e.getCode())) {
				logger.info(
						"Token expired while getting RT purchase history, so generating token and hitting the url...");
				try {
					msisdnToken = utilService.getNewAuthenticationToken(session, msisdn, storeId);
					return getRTPurchaseHistory(msisdnToken, maxItems.toString(), offset.toString(), request, session,
							device);
				} catch (StoreServerException ex) {
					logger.error("Unable to get RT purchase history for msisdn:" + msisdn);
					throw ex;
				}
			} else {
				logger.error("Unable to get RT purchase history for msisdn:" + msisdn);
				throw e;
			}
		}

	}

	private String getRTPurchaseHistory(String msisdnToken, String maxItems, String offset, HttpServletRequest request,
			HttpSession session, Device device) throws StoreServerException {
		String rtPurchaseHistoryUrl = applicationResource.getParameter(session, "pwa.rt.purchase.history.url");
		String storeId = utilService.getStoreId(request, session, device);
		rtPurchaseHistoryUrl = rtPurchaseHistoryUrl.replace("%MAX_ITEMS%", maxItems);
		rtPurchaseHistoryUrl = rtPurchaseHistoryUrl.replace("%OFFSET%", offset);
		rtPurchaseHistoryUrl = rtPurchaseHistoryUrl.replace("%CRED_TOKEN%", msisdnToken);
		rtPurchaseHistoryUrl = rtPurchaseHistoryUrl.replace("%STORE_ID%", storeId);
		rtPurchaseHistoryUrl = webUtils.getUpdatedVoltronUrl(session, rtPurchaseHistoryUrl);

		logger.info("Getting RT Purchase History with url: " + rtPurchaseHistoryUrl);

		String historyContent = null;
		try {
			historyContent = voltronInterface.hitVoltronAPI(session, rtPurchaseHistoryUrl, WebConstants.REQUEST_GET,
					null, String.class);
		} catch (StoreServerException e) {
			logger.error("Something went wrong while getting purchase history for RT: " + e.getMessage(), e);
			throw e;
		}
		logger.info("getRTPurchaseHistory response: " + historyContent);
		return historyContent;
	}


	public String getUnSuscribeServiceResponse(String subscriptionId, HttpServletRequest request, HttpSession session,
			Device device) throws StoreServerException {

		logger.info("Inside unsubscribeService()...");
		String msisdn = utilService.getMsisdn(request, device);
		String storeId = utilService.getStoreId(request, session, device);

		String token = null;
		try {
			token = utilService.getAuthenticationToken(session, msisdn, storeId);
			return unsubscribeService(token, storeId, subscriptionId, request, session, device);
		} catch (StoreServerException e) {
			if (WebConstants.AUTH_TOKEN_EXPIRED.equalsIgnoreCase(e.getCode())) {
				logger.info("Token expired while trying to unsubscribe, so generating token and hitting the url...");
				try {
					token = utilService.getNewAuthenticationToken(session, msisdn, storeId);
					return unsubscribeService(token, storeId, subscriptionId, request, session, device);
				} catch (StoreServerException e1) {
					logger.error("Error while unsubscribing service: ", e1);
					throw e1;
				}
			} else {
				logger.error("Error while unsubscribing service: ", e);
				throw e;
			}
		}

	}

	private String unsubscribeService(String token, String storeId, String subscriptionId, HttpServletRequest request,
			HttpSession session, Device device) throws StoreServerException {
		logger.info("MyTunesService: unsubscribeService()...");

		String url = applicationResource.getParameter(session, "pwa.unsubscribe.service.url");
		url = url.replace("%SUBSCRIPTION_ID%", subscriptionId);
		url = url.replace("%STORE_ID%", storeId);
		url = url.replace("%CRED_TOKEN%", token);
		url = webUtils.getUpdatedVoltronUrl(session, url);

		logger.info("unsubscribe service url: " + url);

		Subscription subscriptionObj = new Subscription();
		subscriptionObj.setCatalogSubscriptionID(Integer.parseInt(subscriptionId));
		subscriptionObj.setStatus("CANCELED");

		String resp = null;
		try {
			resp = voltronInterface.hitVoltronAPI(session, url, WebConstants.REQUEST_POST, subscriptionObj,
					String.class);
		} catch (StoreServerException e) {
			logger.error("Error while unsubscribing service: " + e.getMessage(), e);
			throw e;
		}
		logger.info("unsubscribe response: " + resp);
		return resp;
	}
}
