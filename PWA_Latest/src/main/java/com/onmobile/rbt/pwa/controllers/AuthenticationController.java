package com.onmobile.rbt.pwa.controllers;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mobile.device.Device;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.onmobile.rbt.pwa.services.AuthenticationService;
import com.onmobile.rbt.pwa.services.UtilityService;
import com.onmobile.rbt.pwa.utils.ResponseWrapper;
import com.onmobile.rbt.pwa.utils.StoreServerException;
import com.onmobile.rbt.pwa.utils.WebConstants;
import com.onmobile.rbt.pwa.utils.WebUtilsInterface;

@Controller
public class AuthenticationController {

	private static final Logger logger = LogManager.getLogger(AuthenticationController.class);

	@Autowired
	AuthenticationService authService;

	@Autowired
	UtilityService utilsService;

	@Autowired
	WebUtilsInterface webUtils;

	@RequestMapping(value = "/generateotp", method = RequestMethod.POST)
	@ResponseBody
	public String generateOTP(@RequestBody Map<String, String> jsonRequestBody, HttpServletRequest request,
			HttpSession session, Device device) {
		logger.info("AuthenticationController:: generateOTP()...");
		String msisdn = jsonRequestBody.get("msisdn");
		String type = jsonRequestBody.get("type");
		try {
			return authService.generateOTP(msisdn, type, request, session, device);
		} catch (StoreServerException e) {
			logger.error("Unable to generate OTP for MSISDN: " + msisdn + ", error msg: ", e);
			return webUtils.obtainJSONFromObject(webUtils.getPWAException(e));
		}
	}

	@RequestMapping(value = "/validateotp", method = RequestMethod.POST)
	@ResponseBody
	public String validateOTP(@RequestBody Map<String, String> jsonRequestBody, HttpSession session,
			HttpServletRequest request, Device device) {
		logger.info("AuthenticationController:: verifyOTP()...");
		String msisdn = jsonRequestBody.get("msisdn");
		String pin = jsonRequestBody.get("pin");
		try {
			return authService.validateOTP(msisdn, pin, session, request, device);
		} catch (StoreServerException e) {
			logger.error("Unable to validate OTP for MSISDN: " + msisdn + ", error msg: ", e);
			return webUtils.obtainJSONFromObject(webUtils.getPWAException(e));
		}
	}

	@RequestMapping("/isuserloggedin")
	@ResponseBody
	public String isUserLoggedIn(HttpServletRequest request, Device device) {
		logger.info("AuthenticationController:: isUserLoggedIn()...");
		return authService.isUserLoggedIn(request, device);
	}

	@RequestMapping("/getmsisdn")
	@ResponseBody
	public String getMsisdn(HttpServletRequest request, Device device) {
		logger.info("AuthenticationController :: getMsisdn() ");
		return utilsService.getMsisdn(request, device);
	}

	@RequestMapping(value = "/updatedetails", method = RequestMethod.POST)
	@ResponseBody
	public String updateDetails(@RequestParam(value = "token", required = true) String encryptedMsisdn,
			@RequestParam(value = "tokenKey", required = true) String tokenKey,
			@RequestParam(value = "tokenHeader", required = true) boolean isHeaderUser,
			@RequestParam(value = "fromLocalStorage", required = true) boolean fromLocalStorage,
			@RequestParam(value = "uuid", required = false) String encryptedUUID, HttpSession session,
			HttpServletRequest request, Device device) {
		logger.info("AuthenticationController:: updateMsisdn(), encrypteMsisdn: " + encryptedMsisdn
				+ ", encryptedUuid: " + encryptedUUID);

		ResponseWrapper responseWrapper = authService.updateMsisdn(request, session, device, encryptedMsisdn, tokenKey,
				isHeaderUser, fromLocalStorage, encryptedUUID);

		return webUtils.obtainJSONFromObject(responseWrapper);
	}

	@RequestMapping("/getoomdn")
	@ResponseBody
	public String getDecryptedMsisdnForOoredo(HttpServletRequest request,
			@RequestParam(value = "token", required = true) String token,
			@RequestParam(value = "correlatorId", required = true) String correlatorId, Device device) {
		logger.info("AuthenticationController:: getDecryptedMsisdnForOoredo()...");
		return authService.getDecryptedMsisdnForOoredo(request, device, token, correlatorId);
	}

	@RequestMapping("/getencryptedcontestdata")
	@ResponseBody
	public String getEncryptedDataForContest(HttpServletRequest request, HttpSession session) {
		String encryptedContestData = null;
		try {
			logger.info("Inside getencryptedcontestdata");
			encryptedContestData = authService.getEncryptedDataForContest(request, session);
		} catch (JsonProcessingException e) {
			logger.error("Unable to encrypt msisdn for contest:" + encryptedContestData);
		}

		return encryptedContestData;
	}

	@RequestMapping("/getdecryptedcontestdata")
	@ResponseBody
	public String getDecryptedDataForContest(@RequestParam(value = "token", required = true) String encryptedData,
			@RequestParam(value = "localStorageData", required = false) String localStorageData,
			@RequestParam(value = "storeId", required = false) Integer storeIdIntVal,
			@RequestParam(value = "uuid", required = false) String encryptedUUID, HttpServletRequest request,
			HttpSession session) {

		logger.info("AuthenticationController:: getdecryptedcontestdata()...");
		try {
			return authService.getDecryptedDataForContest(encryptedData, localStorageData, storeIdIntVal, encryptedUUID,
					request, session);
		} catch (StoreServerException e) {
			logger.error("Unable to decrypt: error msg: ", e);
			return webUtils.obtainJSONFromObject(webUtils.getPWAException(e));
		}
	}

	@RequestMapping("/getencryptedmsisdn")
	@ResponseBody
	public String getEncryptedMsisdn(HttpServletRequest request, Device device) {
		logger.info("AuthenticationController :: getencryptedmsisdn() ");

		String msisdn = utilsService.getMsisdn(request, device);
		if (null != msisdn) {
			String encryptedMsisdn = utilsService.getEncryptedMsisdn(msisdn, device);
			if (null != encryptedMsisdn) {
				ResponseWrapper responseWrapper = new ResponseWrapper();
				responseWrapper.setResult("success");
				responseWrapper.setEncryptedMsisdn(encryptedMsisdn);
				return webUtils.obtainJSONFromObject(responseWrapper);
			}
		}
		return null;
	}

	@RequestMapping("/postpwalaunch")
	@ResponseBody
	public String postPwaLaunch(@RequestParam(value = "language", required = true) String language,
			@RequestParam(value = "user_id", required = false) String user_id,
			@RequestParam(value = "subscription_status", required = false) String subscription_status,
			@RequestParam(value = "subscription_type", required = false) String subscription_type,
			@RequestParam(value = "operator", required = false) String operator,
			@RequestParam(value = "circle", required = false) String circle, HttpServletRequest request,
			HttpSession session, Device device) {

		logger.info("AuthenticationController :: postPwaLaunch() ");
		String res = null;
		try {
			res = authService.postPwaLaunch(language, user_id, subscription_status, subscription_type, operator, circle,
					request, session, device);
			logger.info("Response is :: " + res);
		} catch (StoreServerException e) {
			logger.error("Unable to retreive postPwaLaunch: ", e);
			res = webUtils.obtainJSONFromObject(webUtils.getPWAException(e));
		}
		return res;
	}

	@RequestMapping("/getoperatoruserdetails")
	@ResponseBody
	public String getOperatorUserDetails(@RequestParam(value = "token", required = true) String token,
			@RequestParam(value = "ctoken", required = true) String ctoken,
			@RequestParam(value = "mode", required = true) String mode,
			@RequestParam(value = "uuid", required = false) String uuid, HttpServletRequest request,
			HttpSession session, Device device) {

		logger.info("AuthenticationController :: getOperatorUserDetails() ");
		String res = null;
		try {
			res = authService.getOperatorUserDetailsResponse(token, ctoken, mode, uuid, request, session, device);
		} catch (StoreServerException e) {
			logger.error("Unable to retreive getDialogAppUserDetail: ", e);
			res = webUtils.obtainJSONFromObject(webUtils.getPWAException(e));
		}
		return res;
	}

	@RequestMapping("/updatestoreid")
	@ResponseBody
	public String updateStoreId(@RequestParam(value = "storeId", required = true) String storeId,
			HttpServletRequest request, HttpSession session, Device device) {
		logger.info("storing storeId in session: " + storeId);
		session.setAttribute(WebConstants.STORE_ID, storeId);
		ResponseWrapper responseWrapper = new ResponseWrapper();
		responseWrapper.setResult("success");
		return webUtils.obtainJSONFromObject(responseWrapper);
	}

}
