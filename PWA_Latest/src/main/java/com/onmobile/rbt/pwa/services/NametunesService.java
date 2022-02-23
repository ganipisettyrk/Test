package com.onmobile.rbt.pwa.services;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mobile.device.Device;
import org.springframework.stereotype.Service;

import com.onmobile.rbt.pwa.beans.NametunesBean;
import com.onmobile.rbt.pwa.utils.ApplicationResourceInterface;
import com.onmobile.rbt.pwa.utils.ResponseWrapper;
import com.onmobile.rbt.pwa.utils.StoreServerException;
import com.onmobile.rbt.pwa.utils.VoltronInterface;
import com.onmobile.rbt.pwa.utils.WebConstants;
import com.onmobile.rbt.pwa.utils.WebUtilsInterface;

@Service
public class NametunesService implements WebConstants {

	private static final Logger logger = LogManager.getLogger(NametunesService.class);

	@Autowired
	UtilityService utilService;

	@Autowired
	ApplicationResourceInterface applicationResource;

	@Autowired
	VoltronInterface voltronInterface;

	@Autowired
	WebUtilsInterface webUtils;

	public String getNametunes(String nameTune, String maxItemCount, String offset, String type, HttpServletRequest request,
			HttpSession session, Device device) throws StoreServerException {
		logger.info("NameTunesService :: getNameTunes()");

		String url = applicationResource.getParameter(session, "pwa.nametunes.search.url");
		String storeId = utilService.getStoreId(request, session, device);

		url = url.replace("%STORE_ID%", storeId);
		url = url.replace("%SEARCH_QUERY%", nameTune);
		url = url.replace("%TYPE%", type);
		url += "&max=" + maxItemCount + "&offset=" + offset;
		url = webUtils.getUpdatedVoltronUrl(session, url);

		logger.info("Searching Name Tunes for : " + nameTune + " with URL : " + url);

		return voltronInterface.hitVoltronAPI(session, url, REQUEST_GET, null, String.class);

	}

	public String createNametunes(String newNameTune, String type, HttpServletRequest request, HttpSession session, Device device)
			throws StoreServerException {
		logger.info("NameTunesService :: createNameTunes()");

		String newNameTuneLang = applicationResource.getParameter(session, "pwa.nametunes.create.default.language");

		String storeId = utilService.getStoreId(request, session, device);
		String msisdn = utilService.getMsisdn(request, device);

		String token = null;
		NametunesBean nameTunesBean = new NametunesBean(newNameTune, newNameTuneLang, type);
		String nameTunesBeanStr = webUtils.obtainJSONStringFromObject(nameTunesBean);
		logger.info("Request body is: " +nameTunesBeanStr);

		try {
			token = utilService.getAuthenticationToken(session, msisdn, storeId);
			createNameTunes(session, nameTunesBeanStr, newNameTune, storeId, token);
		} catch (StoreServerException storeException) {
			if (AUTH_TOKEN_EXPIRED.equalsIgnoreCase(storeException.getCode())) {
				logger.info("Token expired while creating nametunes, so generating token and hitting the url");
				token = utilService.getNewAuthenticationToken(session, msisdn, storeId);
				createNameTunes(session, nameTunesBeanStr, newNameTune, storeId, token);
			} else {
				throw storeException;
			}
		}
		logger.info("Name tunes requested successfully");

		ResponseWrapper responseWrapper = new ResponseWrapper();
		responseWrapper.setResult("success");

		return webUtils.obtainJSONFromObject(responseWrapper);

	}

	private String createNameTunes(HttpSession session, String nameTunesBeanStr, String newNameTune, String storeId,
			String token) throws StoreServerException {

		String url = applicationResource.getParameter(session, "pwa.nametunes.create.url");
		url = url.replace("%STORE_ID%", storeId);
		url = url.replace("%CRED_TOKEN%", token);
		url = webUtils.getUpdatedVoltronUrl(session, url);

		logger.info("\n Creating Name Tunes for : " + newNameTune + "\n And URL : " + url);

		return voltronInterface.hitVoltronAPI(session, url, REQUEST_POST, nameTunesBeanStr, String.class);

	}

}
