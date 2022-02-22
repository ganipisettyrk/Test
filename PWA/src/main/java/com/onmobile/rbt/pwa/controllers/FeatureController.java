package com.onmobile.rbt.pwa.controllers;

import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mobile.device.Device;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.onmobile.rbt.pwa.beans.ContentLanguageBean;
import com.onmobile.rbt.pwa.services.FeatureService;
import com.onmobile.rbt.pwa.services.UtilityService;
import com.onmobile.rbt.pwa.utils.StoreServerException;
import com.onmobile.rbt.pwa.utils.WebUtilsInterface;

@Controller
public class FeatureController {
	@Autowired
	FeatureService featureService;

	@Autowired
	UtilityService utilService;

	@Autowired
	WebUtilsInterface webUtils;

	private static final Logger logger = LogManager.getLogger(FeatureController.class);

	@RequestMapping("/getbanners")
	@ResponseBody
	public String getBanners(
			@RequestParam(value = "bannerGroup", required = true) String bannerGroup,
			@RequestParam(value = "contentLanguage", required = true) String contentLanguage,
			HttpServletRequest request, HttpSession session, Device device)
			throws Exception {

		try {
			String banners = featureService.populateBanners(request, session, bannerGroup,
					contentLanguage, device);
			return banners;

		} catch (StoreServerException e) {
			String msg = webUtils.obtainJSONFromObject(e);
			logger.error("Unable to retreive Banner contents:" + msg);
			return msg;

		}
	}

	@RequestMapping("/getstoreid")
	@ResponseBody
	public String getStoreId(HttpServletRequest request, HttpSession session,
			Device device) {
		logger.info("FeatureController :: getstoreid()");
		String storeId = utilService.getStoreId(request, session, device);

		return storeId;
	}

	@RequestMapping("/getdynamicpagedata")
	@ResponseBody
	public String getPageDataFromVoltron(
			@RequestParam(value = "pageType", required = true) String pageType,
			@RequestParam(value = "browsingLanguage", required = true) String browsingLanguage,
			HttpServletRequest request, HttpSession session, Device device) {

		logger.info("FeatureController: getdynamicpagedata -> pageType: " + pageType);

		String data = null;
		try {
			data = featureService.getPageDataFromVoltron(pageType, browsingLanguage,
					request, session, device);
		} catch (StoreServerException e) {
			data = webUtils.obtainJSONFromObject(e);
			logger.error("Unable to retreive FAQ/TNC contents:" + data);
		}

		return data;
	}

	/*@RequestMapping("/getstaticpagedata")
	@ResponseBody
	public String getStaticPageData(ModelMap model, HttpSession session,
			@RequestParam(value = "url", required = true) String url) {
		logger.info("FeatureController :: getStaticPageData for about-service/privacy-policy");

		String data = null;
		try {
			data = featureService.getPageStaticData(url);
		} catch (Exception e) {
			data = webUtils.obtainJSONFromObject(e);
			logger.error("Unable to retreive FAQ/TNC contents:" + data);
		}

		return data;
	}*/

	@RequestMapping(value = "/submitfeedback", method = RequestMethod.POST)
	@ResponseBody
	public boolean submitFeedback(
			@RequestBody Map<String, String> jsonRequestBody,
			HttpServletRequest request, HttpSession session, Device device) {

		logger.info("FeatureController:: submitFeedback()");
		try {
			String name = jsonRequestBody.get("name");
			String email = jsonRequestBody.get("email");
			String message = jsonRequestBody.get("message");
			String category = jsonRequestBody.get("category");
			String oem = jsonRequestBody.get("oem");
			String model = jsonRequestBody.get("model");
			String osVersion = jsonRequestBody.get("os_version");
			String appVersion = jsonRequestBody.get("app_version");
			return featureService.submitFeedback(name, email, message, category, oem,
					model, osVersion, appVersion, request, session, device);
		} catch (StoreServerException e) {
			logger.error("Submit feedback failed, Exception msg:" + e);
			return false;
		}

	}

	@RequestMapping("/getcontentlanguages")
	@ResponseBody
	public String getContentLanguages(HttpServletRequest request, HttpSession session) {
		List<ContentLanguageBean> languagesList = null;
		try {
			languagesList = featureService.populateRegionalLanguages(request, session);
		} catch (StoreServerException e) {
			logger.error("Something went wrong while populating content laguages: " 
					+ e.getMessage(), e);
		}

		if (null != languagesList && !languagesList.isEmpty()) {
			return webUtils.obtainJSONFromObject(languagesList);
		} else {
			return null;
		}
	}

	@RequestMapping("/postctdatatovoltron")
	@ResponseBody
	public String sendCleverTapDetails(
			@RequestParam(value = "language", required = true) String language,
			@RequestParam(value = "ctUserId", required = true) String cleverTapUserId,
			@RequestParam(value = "os_version", required = true) String osVersion,
			@RequestParam(value = "utm_params", required = true) String utm_params,
			@RequestParam(value = "notificationsUserId", required = false) String notificationsUserId,
			HttpServletRequest request, HttpSession session, Device device) {
		try {
			return featureService.sendCleverTapDetails(language, cleverTapUserId,
					notificationsUserId, osVersion, utm_params, request, session, device);
		} catch (StoreServerException e) {
			logger.error("error while hitting voltron UEP Natification service for cleverTap id: "
							+ cleverTapUserId);
			return null;
		}

	}
	
	@RequestMapping("/getmadeurl")
	@ResponseBody
	public String getMadeUrl(
			@RequestParam(value = "madeContentType", required = true) String madeContentType,
			@RequestParam(value = "madeContext", required = true) String madeContext,
			@RequestParam(value = "madeRefId", required = true) String madeRefId,
			HttpServletRequest request, HttpSession session, Device device) {
		return featureService.getMadeUrl(madeContentType, madeContext, madeRefId, session);
	}

}