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

import com.onmobile.rbt.pwa.services.SubscriptionService;
import com.onmobile.rbt.pwa.services.UtilityService;
import com.onmobile.rbt.pwa.utils.StoreServerException;
import com.onmobile.rbt.pwa.utils.WebConstants;
import com.onmobile.rbt.pwa.utils.WebUtilsInterface;

@Controller
public class SubscriptionController implements WebConstants {

	private static final Logger logger = LogManager.getLogger(SubscriptionController.class);

	@Autowired
	SubscriptionService subscriptionServiceObj;

	@Autowired
	UtilityService utilsService;

	@Autowired
	WebUtilsInterface webUtils;

	@RequestMapping("/getuserstatus")
	@ResponseBody
	public String getUserStatus(@RequestParam(value = "isRTContent", required = false) boolean isRTContent,
			HttpServletRequest request, HttpSession session, Device device) {
		String userStatus = null;
		try {
			userStatus = utilsService.getUserStatus(request, session, device, isRTContent);
			logger.info("User Status :: " + userStatus);
		} catch (StoreServerException e) {
			logger.error("Unable to get user status", e);
			return webUtils.obtainJSONFromObject(webUtils.getPWAException(e));
		}
		return userStatus;
	}

	@RequestMapping("/getuserinfo")
	@ResponseBody
	public String getUserInfo(HttpServletRequest request, HttpSession session, Device device) {
		String userInfo = null;
		try {
			userInfo = utilsService.getUserInfo(request, session, device);
			logger.info("User Info is :: " + userInfo);
		} catch (StoreServerException e) {
			logger.error("Unable to get User Info", e);
			return webUtils.obtainJSONFromObject(webUtils.getPWAException(e));
		}
		return userInfo;
	}

	@RequestMapping("/getusersubscription")
	@ResponseBody
	public String getUserSubscriptionDetails(@RequestParam(value = "isRTContent", required = false) boolean isRTContent,
			HttpServletRequest request, HttpSession session, Device device) {
		String response = null;
		try {

			response = utilsService.getUserSubscriptionDetails(request, session, device, isRTContent);
			logger.info("usersubscription  :: " + response);
		} catch (StoreServerException e) {
			logger.error("Unable to get usersubscription", e);
			return webUtils.obtainJSONFromObject(webUtils.getPWAException(e));
		}
		return response;
	}

	@RequestMapping("/getmyaccount")
	@ResponseBody
	public String getMyAccountDetails(HttpServletRequest request, HttpSession session, Device device) {
		String accountDetails = null;
		try {
			accountDetails = subscriptionServiceObj.getMyAccountDetails(request, session, device);
			logger.info("MyAccount Details:: " + accountDetails);
		} catch (StoreServerException e) {
			logger.error("Unable to get myaccount: ", e);
			return webUtils.obtainJSONFromObject(webUtils.getPWAException(e));
		}
		return accountDetails;
	}

}
