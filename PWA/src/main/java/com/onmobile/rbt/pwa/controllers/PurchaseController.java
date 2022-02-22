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
import org.springframework.web.bind.annotation.ResponseBody;

import com.onmobile.rbt.pwa.services.PurchaseService;
import com.onmobile.rbt.pwa.utils.StoreServerException;
import com.onmobile.rbt.pwa.utils.WebUtilsInterface;

@Controller
public class PurchaseController {

	@Autowired
	PurchaseService purchaseService;

	@Autowired
	WebUtilsInterface webUtils;

	private static final Logger logger = LogManager.getLogger(PurchaseController.class);

	@RequestMapping(value = "/getpurchasedata", method = RequestMethod.POST)
	@ResponseBody
	public String getPurchaseData(@RequestBody Map<String, String> jsonRequestBody,
			HttpServletRequest request, HttpSession session, Device device) {
		String contentId = jsonRequestBody.get("contentId");
		String contentType = jsonRequestBody.get("contentType");
		String contentSubtype = jsonRequestBody.get("contentSubtype");
		String extMode = jsonRequestBody.get("extMode");
		String browsingLanguage = jsonRequestBody.get("browsingLanguage");
		String response = null;

		if (contentId != null && contentType != null && contentSubtype != null) {
			try {
				response = purchaseService.getPurchaseData(contentId, contentType,
						contentSubtype, extMode, browsingLanguage, request, session, device);
			} catch (StoreServerException e) {
				response = webUtils.obtainJSONFromObject(e);
			}
		} else {
			response = webUtils.obtainJSONFromObject(new Exception("Required fields are missing"));
		}
		return response;
	}

	@RequestMapping(value = "/purchase", method = RequestMethod.POST)
	@ResponseBody
	public String purchase(@RequestBody Map<String, String> jsonRequestBody, 
			HttpServletRequest request, HttpSession session, Device device) {
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
		logger.error("retailPriceId " + retailPriceId + ", external_mode: " + extMode);
		
		String response = null;
		if (contentId != null && contentType != null && caller != null) {
			try {
				response = purchaseService.purchase(contentId, contentType, caller,
						retailPriceId, subtype, subscriptionId, null, playruleId,
						profilePlayRange, browsingLanguage, utm_params, madeRefId, madeContext, extMode,
						request, session, device);
			} catch (StoreServerException e) {
				logger.error("Unable to initiate purchase for content " + contentId);
				response = webUtils.obtainJSONFromObject(e);
			}
		} else {
			response = webUtils.obtainJSONFromObject(new Exception("Required fields are missing"));
		}
		return response;
	}

	@RequestMapping(value = "/getpaymentmethods", method = RequestMethod.POST)
	@ResponseBody
	public String getPaymentMethods(@RequestBody Map<String, String> jsonRequestBody, HttpServletRequest request,
			HttpSession session, Device device) {
		String contentId = jsonRequestBody.get("contentId");
		String contentType = jsonRequestBody.get("contentType");
		String caller = jsonRequestBody.get("caller");
		String retailPriceId = jsonRequestBody.get("retailPriceId");
		String subtype = jsonRequestBody.get("subtype");
		String subscriptionId = jsonRequestBody.get("subscriptionId");
		String playruleId = jsonRequestBody.get("playruleId");
		String profilePlayRange = jsonRequestBody.get("profilePlayRange");
		String response = null;

		if (contentId != null && contentType != null && caller != null && retailPriceId != null) {
			try {
				response = purchaseService.getPaymentMethods(contentId, contentType, caller, retailPriceId, subtype,
						subscriptionId, null, playruleId, profilePlayRange, request, session, device);
			} catch (StoreServerException e) {
				logger.error("Unable to get payment methods for content " + contentId);
				response = webUtils.obtainJSONFromObject(e);
			}
		} else {
			response = webUtils.obtainJSONFromObject(new Exception("Required fields are missing"));
		}
		return response;
	}

	@RequestMapping(value = "/getcomborespafterpayment", method = RequestMethod.POST)
	@ResponseBody
	public String getComboRespAfterPayment(@RequestBody Map<String, String> jsonRequestBody, HttpServletRequest request,
			HttpSession session, Device device) {
		String uniqueId = jsonRequestBody.get("uniqueId");
		String contentId = jsonRequestBody.get("contentId");
		String extraInfo = jsonRequestBody.get("extraInfo");
		String response = null;

		if (contentId != null && uniqueId != null && extraInfo != null) {
			try {
				response = purchaseService.getComboRespAfterPayment(uniqueId, contentId, extraInfo, request, session,
						device);
			} catch (StoreServerException e) {
				logger.error("Unable to get payment confirmation response: " + e.getMessage(), e);
				response = webUtils.obtainJSONFromObject(e);
			}
		} else {
			response = webUtils.obtainJSONFromObject(new Exception("Required fields are missing"));
		}
		return response;
	}

}
