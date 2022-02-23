package com.onmobile.rbt.pwa.services;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.mobile.device.Device;
import org.springframework.stereotype.Service;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;
import com.google.gson.reflect.TypeToken;
import com.onmobile.rbt.pwa.beans.PlayRuleWrapper;
import com.onmobile.rbt.pwa.beans.PurchaseComboWrapper;
import com.onmobile.rbt.pwa.beans.ScheduleWrapperBean;
import com.onmobile.rbt.pwa.beans.ScheduleWrapperBean.ScheduleType;
import com.onmobile.rbt.pwa.utils.ApplicationResourceInterface;
import com.onmobile.rbt.pwa.utils.ResponseWrapper;
import com.onmobile.rbt.pwa.utils.StoreServerException;
import com.onmobile.rbt.pwa.utils.VoltronInterface;
import com.onmobile.rbt.pwa.utils.WebConstants;
import com.onmobile.rbt.pwa.utils.WebUtilsInterface;
import com.onmobile.store.storefront.dto.payment.Purchase;
import com.onmobile.store.storefront.dto.payment.PurchaseCombo;
import com.onmobile.store.storefront.dto.rbt.Asset;
import com.onmobile.store.storefront.dto.rbt.Asset.AssetType;
import com.onmobile.store.storefront.dto.rbt.AssetSubType;
import com.onmobile.store.storefront.dto.rbt.CallingParty;
import com.onmobile.store.storefront.dto.rbt.CallingParty.CallingPartyType;
import com.onmobile.store.storefront.dto.rbt.RBTStation;
import com.onmobile.store.storefront.dto.rbt.Song;
import com.onmobile.store.storefront.dto.user.Subscription;

@Service
public class PurchaseService implements WebConstants {
	private static final Logger logger = LogManager.getLogger(PurchaseService.class);

	@Autowired
	UtilityService utilService;

	@Autowired
	MytunesService mytunesService;

	@Autowired
	ApplicationResourceInterface applicationResource;

	@Autowired
	WebUtilsInterface webUtils;

	@Autowired
	VoltronInterface voltronInterface;

	@Autowired
	ContentService contentService;

	@Autowired
	CacheManager cacheManager;

	public String getPurchaseDataResponse(Map<String, String> jsonRequestBody, HttpServletRequest request,
			HttpSession session, Device device) throws StoreServerException {

		String contentId = jsonRequestBody.get("contentId");
		String contentType = jsonRequestBody.get("contentType");
		String contentSubtype = jsonRequestBody.get("contentSubtype");
		String extMode = jsonRequestBody.get("extMode");
		String browsingLanguage = jsonRequestBody.get("browsingLanguage");

		if (contentId != null && contentType != null && contentSubtype != null) {

			return getPurchaseData(contentId, contentType, contentSubtype, extMode, browsingLanguage, request, session,
					device);
		} else {
			return webUtils.obtainJSONFromObject(new Exception("Required fields are missing"));
		}
	}

	private String getPurchaseData(String contentId, String contentType, String contentSubtype, String extMode,
			String browsingLanguage, HttpServletRequest request, HttpSession session, Device device)
			throws StoreServerException {

		logger.info("Inside PurchaseService, getPurchaseData()...");

		String msisdn = utilService.getMsisdn(request, device);
		String storeId = utilService.getStoreId(request, session, device);
		String userId = utilService.getUserId(request, session, device);

		String purchaseData = null;
		String url = applicationResource.getParameter(session, "pwa.user.subscriptions.url");
		url = url.replace("%STORE_ID%", storeId);
		url = url.replace("%USER_ID%", userId);
		url = url.replace("%PARAM_TYPE%", contentType);
		url = url.replace("%PARAM_SUBTYPE%", contentSubtype);
		if (null != extMode && url.contains("%MODE%")) {
			url = url.replace("%MODE%", extMode);
		} else {
			url = url.replace("&sfMode=%MODE%", "");
		}
		url = url.replace("%BROWSING_LANGUAGE%", browsingLanguage);

		boolean isRTContent = false;
		if ("realtone".equalsIgnoreCase(contentType)) {
			url += "&contentType=" + contentType;
			isRTContent = true;
		}
		if (url.contains("status")) {
			try {
				String status = utilService.getVoltronUserStatus(request, session, device, isRTContent);
				url = url.replace("%STATUS%", status);
			} catch (StoreServerException e) {
				logger.error("Error while getting user status: " + e.getMessage(), e);
			}
		}
		url = webUtils.getUpdatedVoltronUrl(session, url);

		logger.info("Getting allowed subscriptions for: " + msisdn + "by hitting url: " + url);

		try {
			purchaseData = voltronInterface.hitVoltronAPI(session, url, REQUEST_GET, null, String.class);
			logger.info("Allowed subscriptions: " + purchaseData);
		} catch (StoreServerException e) {
			logger.error("Something went wrong while getting Allowed subscription for: " + msisdn);
			throw e;
		}
		return purchaseData;
	}

	public String purchaseResponse(Map<String, String> jsonRequestBody, HttpServletRequest request, HttpSession session,
			Device device) throws StoreServerException {

		String contentId = jsonRequestBody.get("contentId");
		String contentType = jsonRequestBody.get("contentType");
		String caller = jsonRequestBody.get("caller");
		String retailPriceId = jsonRequestBody.get("retailPriceId");
		String subtype = jsonRequestBody.get("subtype");
		String subscriptionId = jsonRequestBody.get("subscriptionId");
		String playruleId = jsonRequestBody.get("playruleId");
		String profilePlayRange = jsonRequestBody.get("profilePlayRange");
		String browsingLanguage = jsonRequestBody.get("browsingLanguage");
		String utm_params = jsonRequestBody.get("utm_params");
		String madeRefId = jsonRequestBody.get("madeRefId");
		String madeContext = jsonRequestBody.get("madeContext");
		String extMode = jsonRequestBody.get("extMode");

		if (contentId != null && contentType != null && caller != null) {

			return purchase(contentId, contentType, caller, retailPriceId, subtype, subscriptionId, null, playruleId,
					profilePlayRange, browsingLanguage, utm_params, madeRefId, madeContext, extMode, request, session,
					device);
		} else {
			return webUtils.obtainJSONFromObject(new Exception("Required fields are missing"));
		}
	}

	private String purchase(String contentId, String contentType, String caller, String retailPriceId, String subtype,
			String subscriptionId, String editSelectionType, String playruleId, String profilePlayRange,
			String browsingLanguage, String utm_params, String madeRefId, String madeContext, String extMode,
			HttpServletRequest request, HttpSession session, Device device) throws StoreServerException {
		logger.info("In PurchaseService: content Id-" + contentId);

		String userType = getUserNetworkType(session, device);

		String msisdn = utilService.getMsisdn(request, device);

		if (!"DEFAULT".equalsIgnoreCase(caller) && msisdn.equals(caller)) {
			logger.info("PurchaseService:: User entered his own number, not continuing further...");
			StoreServerException storeException = new StoreServerException();
			storeException.setDescription(applicationResource.getParameter(session, "pwa.own.number.error"));
			throw storeException;
		}

		String storeId = utilService.getStoreId(request, session, device);

		if ("allCaller".equals(editSelectionType)) {
			logger.info("User trying to modify all caller setting, so deleting all caller setting first...");
			try {
				mytunesService.getDeleteSpecificCallerSettingsResponse(playruleId, request, session, device);
				logger.info("Deleted All caller selection while adding special caller to it..");
			} catch (StoreServerException e) {
				logger.error("Unable to delete all caller selection.. While editing All caller selection.." + e);
				throw e;
			}
		}

		String offlineCGFlow = applicationResource.getParameter(session, "pwa.enable.offline.cgflow", "false");
		logger.info("offlineCGFlow: " + offlineCGFlow);

		PurchaseComboWrapper comboObj = prepareComboObj(null, contentId, contentType, caller, retailPriceId, subtype,
				subscriptionId, playruleId, profilePlayRange, browsingLanguage, offlineCGFlow, userType, utm_params,
				madeRefId, madeContext, extMode, request, session);

		String comboJsonString = webUtils.obtainJSONStringFromObject(comboObj);
		logger.info("Purchase Combo Json String : " + comboJsonString);
		String comboApiResp = null;
		String token = null;

		try {
			token = utilService.getAuthenticationToken(session, msisdn, storeId);
			comboApiResp = purchase(session, comboJsonString, storeId, token);
		} catch (StoreServerException ex) {

			if (AUTH_TOKEN_EXPIRED.equalsIgnoreCase(ex.getCode())) {
				logger.info("Token expired while purchase, so generating token and hitting the url...");
				token = utilService.getNewAuthenticationToken(session, msisdn, storeId);
				comboApiResp = purchase(session, comboJsonString, storeId, token);
			} else {
				logger.error("Exception while purchase: " + msisdn, ex);
				throw ex;
			}
		}

		if ("realtone".equalsIgnoreCase(contentType)) {
			comboApiResp = appendTokenToComboResp(comboApiResp, token);
		}

		PurchaseCombo purchaseCombo = (PurchaseCombo) webUtils.fromStringToObject(comboApiResp, PurchaseCombo.class);

		if (purchaseCombo.getThirdpartyconsent() != null) {
			String rUrl = purchaseCombo.getThirdpartyconsent().getReturnUrl();
			String thirdPartyURL = purchaseCombo.getThirdpartyconsent().getThirdPartyUrl();
			logger.info("Third party consent URL : " + thirdPartyURL + " and R-URL : " + rUrl);

			if ("true".equalsIgnoreCase(offlineCGFlow) && NON_OPT_NETWORK.equals(userType)
					&& (thirdPartyURL == null || thirdPartyURL.isEmpty())) {
				rUrl += "&status_code=1";
				logger.info("Offline CG Flow is " + offlineCGFlow + " , userType: " + userType
						+ "and third party URL is null, so directly hitting R-URL "
						+ "by appending status_code=1 and URL: " + rUrl);

				String rUrlResp = voltronInterface.hitVoltronAPI(session, rUrl, REQUEST_GET, null, String.class);
				logger.info("R-URL Response: " + rUrlResp);
				return rUrlResp;
			}
			session.setAttribute(WebConstants.CONSENT_CONTENT_ID, contentId);
		}
		return comboApiResp;
	}

	private String appendTokenToComboResp(String comboResp, String token) {
		Gson gson = new GsonBuilder().create();
		JsonObject jsonObj = gson.fromJson(comboResp, JsonObject.class);
		jsonObj.addProperty("cred_token", token);
		String resp = gson.toJson(jsonObj);
		logger.info("combo resp for RT after adding token: " + resp);
		return resp;
	}

	@Cacheable(cacheNames = "purchaseComboCache", key = "#uniqueId")
	public PurchaseComboWrapper prepareComboObj(String uniqueId, String contentId, String contentType, String caller,
			String retailPriceId, String subtype, String subscriptionId, String playruleId, String profilePlayRange,
			String browsingLanguage, String offlineCGFlow, String userType, String utm_params, String madeRefId,
			String madeContext, String extMode, HttpServletRequest request, HttpSession session) {

		Map<String, String> billingInfo = new HashMap<String, String>();

		Purchase purchaseObj = new Purchase();
		if (null != retailPriceId) {
			purchaseObj.setRetailPriceId(retailPriceId);
		}
		if ("realtone".equalsIgnoreCase(contentType)) {
			purchaseObj.setCatalogSubscriptionId(Integer.parseInt(subscriptionId));
		}

		Map<String, Object> extraInfoMap = new HashMap<String, Object>();

		if (null != utm_params) {
			Map<String, Object> utmParamsMap = webUtils.fromJsonToType(utm_params,
					new TypeToken<Map<String, Object>>() {
					}.getType());
			extraInfoMap.putAll(utmParamsMap);
		}
		if (null != extMode) {
			extraInfoMap.put("purchase_mode", extMode);
		}
		if (null != extraInfoMap) {
			purchaseObj.setExtraInfo(extraInfoMap);
		}

		Subscription subscriptionObj = null;
		if (null != subscriptionId && !subscriptionId.isEmpty()) {
			logger.info("User is a new/upgrade user, so sending the subscription object to "
					+ "the combo API with subscriptionId: " + subscriptionId);
			subscriptionObj = new Subscription();
			subscriptionObj.setCatalogSubscriptionID(Integer.parseInt(subscriptionId));

			if (null != browsingLanguage && !browsingLanguage.isEmpty()) {
				subscriptionObj.setLanguage(browsingLanguage);
			}
			if ("true".equalsIgnoreCase(offlineCGFlow) && NON_OPT_NETWORK.equals(userType)) {
				billingInfo.put(NETWORK_TYPE, NON_OPT_NETWORK);
				subscriptionObj.setBillingInfo(billingInfo);
			}
			if (null != extraInfoMap) {
				subscriptionObj.setExtraInfo(extraInfoMap);
			}
		} else if ("true".equalsIgnoreCase(offlineCGFlow) && NON_OPT_NETWORK.equals(userType)) {
			billingInfo.put(NETWORK_TYPE, NON_OPT_NETWORK);
			purchaseObj.setBillingInfo(billingInfo);
		}

		Asset asset = null;
		if ("ringback".equalsIgnoreCase(contentType) || "realtone".equalsIgnoreCase(contentType)) {
			Song song = new Song();
			song.setId(Long.parseLong(contentId));
			song.setType(AssetType.SONG);
			if ("realtone".equalsIgnoreCase(contentType)) {
				song.setType(AssetType.REALTONE);
				song.setMadeReferenceId(madeRefId);
				song.setMadeContext(madeContext);
				String mediaExtn = applicationResource.getParameter(session, "pwa.rt.media.extension");
				song.setMediaExtension(mediaExtn);
			}
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
		if (!("ringback".equalsIgnoreCase(contentType) && "ringback_profile".equalsIgnoreCase(subtype))) {
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
		playrule.setReverse(false);

		PurchaseComboWrapper comboObj = new PurchaseComboWrapper();
		comboObj.setAsset(asset);
		comboObj.setPlayrule(playrule);
		comboObj.setPurchase(purchaseObj);
		comboObj.setSubscription(subscriptionObj);

		return comboObj;
	}

	private String purchase(HttpSession session, String comboJsonString, String storeId, String token)
			throws StoreServerException {

		String url = applicationResource.getParameter(session, "pwa.combo.purchase.url");
		url = url.replace("%STORE_ID%", storeId);
		url = url.replace("%CRED_TOKEN%", token);
		url = webUtils.getUpdatedVoltronUrl(session, url);

		String comboApiResp = null;
		logger.info("Going to hit combo url: " + url + " with comboJson: " + comboJsonString);

		comboApiResp = voltronInterface.hitVoltronAPI(session, url, REQUEST_POST, comboJsonString, String.class);

		logger.info("Combo API response is: " + comboApiResp);
		return comboApiResp;
	}

	private String getUserNetworkType(HttpSession session, Device device) {
		String userType = "non_opt_network";

		if (utilService.isAcessedFromMobileDevice(device)) {
			boolean headerMsisdn = false;
			Object value = session.getAttribute(HEADERMSISDN);

			if (null != value) {
				headerMsisdn = (Boolean) value;
			}

			if (headerMsisdn) {
				userType = "opt_network";
			}
		}
		logger.info("user network type: " + userType);
		return userType;
	}

	public String getPaymentMethodsResponse(Map<String, String> jsonRequestBody, HttpServletRequest request,
			HttpSession session, Device device) throws StoreServerException {

		String contentId = jsonRequestBody.get("contentId");
		String contentType = jsonRequestBody.get("contentType");
		String caller = jsonRequestBody.get("caller");
		String retailPriceId = jsonRequestBody.get("retailPriceId");
		String subtype = jsonRequestBody.get("subtype");
		String subscriptionId = jsonRequestBody.get("subscriptionId");
		String playruleId = jsonRequestBody.get("playruleId");
		String profilePlayRange = jsonRequestBody.get("profilePlayRange");

		if (contentId != null && contentType != null && caller != null && retailPriceId != null) {
			return getPaymentMethods(contentId, contentType, caller, retailPriceId, subtype, subscriptionId, null,
					playruleId, profilePlayRange, request, session, device);
		} else {
			return webUtils.obtainJSONFromObject(new Exception("Required fields are missing"));
		}
	}

	private String getPaymentMethods(String contentId, String contentType, String caller, String retailPriceId,
			String subtype, String subscriptionId, String editSelectionType, String playruleId, String profilePlayRange,
			HttpServletRequest request, HttpSession session, Device device) throws StoreServerException {
		logger.info("Inside PurchaseService: getPaymentMethods().contentId.." + contentId);

		String offlineCGFlow = applicationResource.getParameter(session, "pwa.enable.offline.cgflow", "false");
		logger.info("offlineCGFlow: " + offlineCGFlow);

		String msisdn = utilService.getMsisdn(request, device);
		logger.info("PurchaseService, getPaymentMethods(): Msisdn= " + msisdn);

		String userType = getUserNetworkType(session, device);
		String storeId = utilService.getStoreId(request, session, device);
		String uninqueKey = UUID.randomUUID().toString();
		Map<String, Object> cacheMap = new HashMap<String, Object>();
		// Store this combo in ehcache

		PurchaseComboWrapper comboObj = prepareComboObj(uninqueKey, contentId, contentType, caller, retailPriceId,
				subtype, subscriptionId, playruleId, profilePlayRange, null, offlineCGFlow, userType, null, null, null,
				null, request, session);

		Cache cache = cacheManager.getCache("purchaseComboCache");
		logger.info("putting headermsisdn into cache " + session.getAttribute(HEADERMSISDN));
		cacheMap.put("headermsisdn", session.getAttribute(HEADERMSISDN));
		cacheMap.put("msisdn", msisdn);
		cacheMap.put("storeId", storeId);
		cacheMap.put("comboObj", comboObj);

		cache.put(uninqueKey, cacheMap);

		String comboJsonString = webUtils.obtainJSONStringFromObject(comboObj);

		ResponseWrapper respWrapper = new ResponseWrapper();
		String paymentMethodsApiResp = null;
		String token = null;

		try {
			token = utilService.getAuthenticationToken(session, msisdn, storeId);
			paymentMethodsApiResp = getPaymentMethods(session, comboJsonString, storeId, token);
		} catch (StoreServerException ex) {

			if (AUTH_TOKEN_EXPIRED.equalsIgnoreCase(ex.getCode())) {
				logger.info("Token expired while getting payment methods, so generating token and hitting the url...");
				token = utilService.getNewAuthenticationToken(session, msisdn, storeId);
				paymentMethodsApiResp = getPaymentMethods(session, comboJsonString, storeId, token);
			} else {
				logger.error("Exception while getting payment methods: " + msisdn, ex);
				throw ex;
			}
		}
		respWrapper.setUniqueId(uninqueKey);
		respWrapper.setResult(paymentMethodsApiResp);
		return webUtils.obtainJSONFromObject(respWrapper);
	}

	private String getPaymentMethods(HttpSession session, String comboJsonString, String storeId, String token)
			throws StoreServerException {

		String url = applicationResource.getParameter(session, "pwa.getpaymentmethods.url");
		url = url.replace("%STORE_ID%", storeId);
		url = url.replace("%CRED_TOKEN%", token);
		url = webUtils.getUpdatedVoltronUrl(session, url);

		logger.info("Going to hit getPaymentMethods url: " + url + " with comboJson: " + comboJsonString);

		String getPaymentMethodsApiResp = voltronInterface.hitVoltronAPI(session, url, REQUEST_POST, comboJsonString,
				String.class);

		logger.info("getPaymentMethods API response is: " + getPaymentMethodsApiResp);
		return getPaymentMethodsApiResp;
	}

	public String getComboRespAfterPaymentResponse(Map<String, String> jsonRequestBody, HttpServletRequest request,
			HttpSession session, Device device) throws StoreServerException {

		String uniqueId = jsonRequestBody.get("uniqueId");
		String contentId = jsonRequestBody.get("contentId");
		String extraInfo = jsonRequestBody.get("extraInfo");

		if (contentId != null && uniqueId != null && extraInfo != null) {
			return getComboRespAfterPayment(uniqueId, contentId, extraInfo, request, session, device);
		} else {
			return webUtils.obtainJSONFromObject(new Exception("Required fields are missing"));
		}
	}

	private String getComboRespAfterPayment(String uniqueId, String contentId, String extraInfo,
			HttpServletRequest request, HttpSession session, Device device) throws StoreServerException {
		logger.info("inside PurchaseService, getComboRespAfterPayment()...");
		Map<String, Object> extraInfoMap = new HashMap<String, Object>();
		Map<String, Object> thirdPartyInfoMap = new HashMap<String, Object>();
		Map<String, Object> cacheMap = null;
		String offlineCGFlow = applicationResource.getParameter(session, "pwa.enable.offline.cgflow", "false");
		// get purchaseCombo obj from cache
		Cache cache = cacheManager.getCache("purchaseComboCache");
		if (null != cache) {
			cacheMap = (HashMap) cache.get(uniqueId).get();
		}
		if (null != cacheMap) {
			String msisdn = (String) cacheMap.get("msisdn");
			String storeId = (String) cacheMap.get("storeId");
			logger.info("cache msisdn: " + msisdn + ", storeId: " + storeId);
			if (null != msisdn && null != storeId) {
				session.setAttribute(MSISDN, msisdn);
				session.setAttribute(STORE_ID, storeId);
			}
			if (null != cacheMap.get("headermsisdn")) {
				logger.info("headermsisdn from cache: " + session.getAttribute(HEADERMSISDN) + ", "
						+ cacheMap.get("headermsisdn"));
				session.setAttribute(HEADERMSISDN, cacheMap.get("headermsisdn"));
			}
			String userType = getUserNetworkType(session, device);
			logger.info("offlineCGFlow: " + offlineCGFlow + ", userType: " + userType);

			String token = null;

			PurchaseComboWrapper comboObj = (PurchaseComboWrapper) cacheMap.get("comboObj");
			logger.info("comboObj from cache: " + comboObj);
			// decode extraInfo param
			try {
				extraInfo = URLDecoder.decode(extraInfo, "UTF-8");
			} catch (UnsupportedEncodingException e) {
				logger.error("something went wrong while decoding the extraInfo: " + e.getMessage(), e);
			}
			// prepare extraInfoMap using decoded extraInfo param
			String[] strArr = extraInfo.split("&");
			for (int i = 0; i < strArr.length; i++) {
				extraInfoMap.put(strArr[i].split("=")[0], strArr[i].split("=")[1]);
			}
			// pass extraInfoMap in extraInfo of subscription and purchase
			thirdPartyInfoMap.put("thirdparty_billing_info", extraInfoMap);
			Purchase purchaseObj = comboObj.getPurchase();
			if (null != purchaseObj) {
				purchaseObj.setExtraInfo(thirdPartyInfoMap);
				comboObj.setPurchase(purchaseObj);
			}
			Subscription subscriptionObj = comboObj.getSubscription();
			if (null != subscriptionObj) {
				subscriptionObj.setExtraInfo(thirdPartyInfoMap);
				comboObj.setSubscription(subscriptionObj);
			}
			String comboJsonString = webUtils.obtainJSONStringFromObject(comboObj);
			logger.info("comboObj after replacing extraInfo: " + comboJsonString);
			String comboResp = null;
			try {
				token = utilService.getAuthenticationToken(session, msisdn, storeId);
				comboResp = purchase(session, comboJsonString, storeId, token);
				logger.info("combo response after payment: " + comboResp);
			} catch (StoreServerException ex) {
				if (AUTH_TOKEN_EXPIRED.equalsIgnoreCase(ex.getCode())) {
					logger.info("Token expired while getting combo response after payment,"
							+ " so generating token and hitting the url...");
					token = utilService.getNewAuthenticationToken(session, msisdn, storeId);
					comboResp = purchase(session, comboJsonString, storeId, token);
				} else {
					logger.error("Exception while getting combo response after payment: " + msisdn, ex);
					throw ex;
				}
			}

			PurchaseCombo purchaseCombo = (PurchaseCombo) webUtils.fromStringToObject(comboResp, PurchaseCombo.class);

			if (purchaseCombo.getThirdpartyconsent() != null) {
				String rUrl = purchaseCombo.getThirdpartyconsent().getReturnUrl();
				String thirdPartyURL = purchaseCombo.getThirdpartyconsent().getThirdPartyUrl();
				logger.info("Third party consent URL : " + thirdPartyURL + " and R-URL : " + rUrl);

				if ("true".equalsIgnoreCase(offlineCGFlow) && NON_OPT_NETWORK.equals(userType)
						&& (thirdPartyURL == null || thirdPartyURL.isEmpty())) {
					rUrl += "&status_code=1";
					logger.info("Offline CG Flow is " + offlineCGFlow + " , userType: " + userType
							+ "and third party URL is null, so directly hitting R-URL "
							+ "by appending status_code=1 and URL: " + rUrl);

					String rUrlResp = voltronInterface.hitVoltronAPI(session, rUrl, REQUEST_GET, null, String.class);
					logger.info("R-URL Response: " + rUrlResp);
					return rUrlResp;
				}
				session.setAttribute(WebConstants.CONSENT_CONTENT_ID, contentId);
			}
			return comboResp;
		} else {
			throw new StoreServerException();
		}
	}
}
