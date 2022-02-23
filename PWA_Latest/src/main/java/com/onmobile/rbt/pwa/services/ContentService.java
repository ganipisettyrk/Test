package com.onmobile.rbt.pwa.services;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mobile.device.Device;
import org.springframework.stereotype.Service;

import com.onmobile.rbt.pwa.utils.ApplicationResourceInterface;
import com.onmobile.rbt.pwa.utils.StoreServerException;
import com.onmobile.rbt.pwa.utils.VoltronInterface;
import com.onmobile.rbt.pwa.utils.WebConstants;
import com.onmobile.rbt.pwa.utils.WebUtilsInterface;

@Service
public class ContentService implements WebConstants {

	private static final Logger logger = LogManager.getLogger(ContentService.class);

	@Autowired
	UtilityService utilService;

	@Autowired
	ApplicationResourceInterface applicationResource;

	@Autowired
	VoltronInterface voltronInterface;

	@Autowired
	WebUtilsInterface webUtils;

	public String getContentMetadata(Integer contentIdIntVal, String contentType,
			String paramType, String paramSubtype, String browsingLanguage,
			String extMode, String showAvailability, HttpServletRequest request,
			HttpSession session, Device device) throws StoreServerException {
		logger.info("Inside ContentService, getContentMetadata()...");

		String storeId = utilService.getStoreId(request, session, device);

		String msisdn = utilService.getMsisdn(request, device);
		String contentId = contentIdIntVal.toString();
		
		String url = applicationResource.getParameter(session, "pwa.content.dto.url");
		url = url.replace("%STORE_ID%", storeId);
		url = url.replace("%TYPE%", contentType);
		url = url.replace("%CONTENT_ID%", contentId);
		url = url.replace("%BROWSING_LANGUAGE%", browsingLanguage);
		
		if (null != paramType) {
			url += "&param_type=" + paramType;
		}
		//We should not pass param_subtype in case of shuffles
		if (null != paramSubtype && !contentType.equalsIgnoreCase("ringback_station")) {
			url += "&param_subtype=" + paramSubtype;
		}
		
		if (null != extMode && url.contains("%MODE%")) {
			url = url.replace("%MODE%", extMode);
		} else {
			url = url.replace("&sfMode=%MODE%", "");
		}

		if(!Boolean.parseBoolean(showAvailability)) {
			if(url.contains("&showAvailability")) {
			  url = url.replace("&showAvailability=true", "");
			} else if(url.contains("showAvailability")){
			  url = url.replace("showAvailability=true&", "");
			}
		}
		
		url = webUtils.getUpdatedVoltronUrl(session, url);

		if (null != msisdn) {
			String userId = utilService.getUserId(request, session, device);
			url += "&userId=" + userId;
		}

		logger.info("Retreiving content with url : " + url);

		try {
			String contentMetadata = voltronInterface.hitVoltronAPI(session, url,
					REQUEST_GET, null, String.class);
			logger.info("ContnentMetadata for contetId: " + contentId + " is: "
					+ contentMetadata);
			return contentMetadata;
		} catch (StoreServerException e) {
			logger.error("Something went wrong while getting content metadata for contentId: "
					+ contentId);
			throw e;
		}
	}
	
}
