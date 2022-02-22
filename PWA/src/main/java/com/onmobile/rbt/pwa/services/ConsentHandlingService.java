package com.onmobile.rbt.pwa.services;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.onmobile.rbt.pwa.utils.ApplicationResourceInterface;
import com.onmobile.rbt.pwa.utils.StoreServerException;
import com.onmobile.rbt.pwa.utils.VoltronInterface;
import com.onmobile.rbt.pwa.utils.WebConstants;
import com.onmobile.rbt.pwa.utils.WebUtilsInterface;

@Service
public class ConsentHandlingService implements WebConstants {
	private static final Logger logger = LogManager.getLogger(ConsentHandlingService.class);

	@Autowired
	VoltronInterface voltronInterface;

	@Autowired
	WebUtilsInterface webUtils;

	@Autowired
	ApplicationResourceInterface applicationResource;

	public String getConsentResponse(HttpServletRequest request, HttpSession session) {

		logger.info("inside ConsentHandlingService, getConsentResponse()...");
		String queryString = request.getQueryString();

		String callbackUrl = applicationResource.getParameter(session, "pwa.consent.voltron.return.url");

		callbackUrl = webUtils.getUpdatedVoltronUrl(session, callbackUrl);
		if (!callbackUrl.contains("?")) {
			callbackUrl += "?";
		}
		if (null != queryString) {
			callbackUrl += queryString;
		}

		logger.info("Return URL hitting voltron rurl: " + callbackUrl);

		try {
			String apiResponse = voltronInterface.hitVoltronAPI(session, callbackUrl,
					REQUEST_GET, null, String.class, false);
			logger.info("consent rurl hit response: " + apiResponse);
			return apiResponse;
		} catch (StoreServerException e) {
			String msg = webUtils.obtainJSONFromObject(e);
			logger.info("Exception while hitting Return URL...." + msg);
			return msg;
		}
	}

}
