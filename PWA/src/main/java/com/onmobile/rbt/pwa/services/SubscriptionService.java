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
public class SubscriptionService implements WebConstants {
	private static final Logger logger = LogManager.getLogger(SubscriptionService.class);

	@Autowired
	UtilityService utilService;

	@Autowired
	ApplicationResourceInterface applicationResource;

	@Autowired
	WebUtilsInterface webUtils;

	@Autowired
	VoltronInterface voltronInterface;


	public String getMyAccountDetails(HttpServletRequest request, HttpSession session,
		Device device) throws StoreServerException {
		logger.info("SubscriptionService: getMyAccountDetails()...");
		
		String msisdn = utilService.getMsisdn(request, device);
		String storeId = utilService.getStoreId(request, session, device);
		String token = null;		
		String myaccountDetails = null;
		if(null != msisdn){		
			try {
				token = utilService.getAuthenticationToken(session, msisdn, storeId);
				myaccountDetails = getMyAccountDetails(session, storeId, token);
			} catch (StoreServerException ex) {
				if (AUTH_TOKEN_EXPIRED.equalsIgnoreCase(ex.getCode())) {
					logger.info("Token expired while getting myaccount details, so generating token and hitting the url...");
					token = utilService.getNewAuthenticationToken(session, msisdn, storeId);
					myaccountDetails = getMyAccountDetails(session, storeId, token);
				} else {
					logger.error("Exception while myaccount hit: " + msisdn, ex);
					throw ex;
				}
			}
		}
		return myaccountDetails;
	}
	
	private String getMyAccountDetails(HttpSession session, String storeId, String token)
			throws StoreServerException {
		String url = applicationResource.getParameter(session, "pwa.mysubscription.details.url");
		url = url.replace("%STORE_ID%", storeId);
		url = url.replace("%CRED_TOKEN%", token);
		url = webUtils.getUpdatedVoltronUrl(session, url);
		logger.info("Going to hit myaccount details url: " + url);
		
		String myaccountDetails = voltronInterface.hitVoltronAPI(session, url,
				WebConstants.REQUEST_GET, null, String.class);
		logger.info("myaccount details: " + myaccountDetails);
		return myaccountDetails;
	}

}
