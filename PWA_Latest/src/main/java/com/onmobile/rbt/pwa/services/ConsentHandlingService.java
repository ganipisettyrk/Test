package com.onmobile.rbt.pwa.services;

import java.net.URLEncoder;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.onmobile.encryptor.PasswordEncryptor;
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

	@Autowired
	UtilityService utilService;

	public String getConsentResponse(HttpServletRequest request, HttpSession session) {

		logger.info("inside ConsentHandlingService, getConsentResponse()...");
		String queryString = request.getQueryString();
		logger.info("queryString " + queryString);

		if (null != queryString && queryString.contains("cgUtilityResp")) {
			queryString = getUpdatedQueryString(request, session, queryString);
		}

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
			String apiResponse = voltronInterface.hitVoltronAPI(session, callbackUrl, REQUEST_GET, null, String.class,
					false);
			logger.info("consent rurl hit response: " + apiResponse);
			session.removeAttribute(WebConstants.CONSENT_CONTENT_ID);
			return apiResponse;
		} catch (StoreServerException e) {
			String msg = webUtils.obtainJSONFromObject(e);
			logger.error("Exception while hitting Return URL...." + msg);
			return msg;
		}
	}

	private String getUpdatedQueryString(HttpServletRequest request, HttpSession session, String qString) {
		try {

			Map<String, String[]> values = request.getParameterMap();
			boolean contentIdResult = false;

			if (values.containsKey("contentId")) {
				String[] val = values.get("contentId");
				String contentId = val[0];
				Object contentInSession = session.getAttribute(WebConstants.CONSENT_CONTENT_ID);

				if (null != contentId && null != contentInSession && contentInSession.toString().equals(contentId)) {
					contentIdResult = true;
				}
			}

			if (!contentIdResult) {
				return qString;
			}

			for (Map.Entry<String, String[]> val : values.entrySet()) {
				String paramKey = val.getKey();
				String[] paramValue = val.getValue();
				if (paramKey.equals("cgUtilityResp")) {
					String decryptedValue = PasswordEncryptor.decrypt(paramValue[0]);
					if (null != decryptedValue && decryptedValue.contains("tVal")
							&& decryptedValue.contains("encToken")) {
						String[] result = decryptedValue.split("&tVal");
						if (null != result && result.length == 2) {
							decryptedValue = result[0];
							String[] encValue = decryptedValue.split("&consent=");
							if (null != encValue && encValue.length == 2) {
								String[] encArr = encValue[0].split("=");
								if (null != encArr && encArr.length == 2 && encArr[0].equals("encToken")) {
									String msisdnInUrl = encArr[1];
									String msisdnInSession = utilService.getMsisdn(request, null);
									if (null != msisdnInUrl && null != msisdnInSession
											&& msisdnInUrl.equals(msisdnInSession)) {
										decryptedValue = decryptedValue.replace(encValue[0] + "&", "");
										String encodedValue = URLEncoder.encode(paramValue[0], "UTF-8");
										qString = qString.replace(paramKey + "=" + encodedValue, decryptedValue);
										return qString;
									}
								}
							}
						}
					}

				}

			}

		} catch (Exception e) {
			logger.error("Exception while decrypting", e);

		}

		return qString;
	}

}
