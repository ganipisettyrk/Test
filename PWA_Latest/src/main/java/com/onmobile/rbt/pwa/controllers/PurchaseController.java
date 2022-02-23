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
	public String getPurchaseData(@RequestBody Map<String, String> jsonRequestBody, HttpServletRequest request,
			HttpSession session, Device device) {
		try {
			return purchaseService.getPurchaseDataResponse(jsonRequestBody, request, session, device);
		} catch (StoreServerException e) {
			logger.error("Unable to get purchase data", e);
			return webUtils.obtainJSONFromObject(webUtils.getPWAException(e));
		}

	}

	@RequestMapping(value = "/purchase", method = RequestMethod.POST)
	@ResponseBody
	public String purchase(@RequestBody Map<String, String> jsonRequestBody, HttpServletRequest request,
			HttpSession session, Device device) {

		try {
			return purchaseService.purchaseResponse(jsonRequestBody, request, session, device);
		} catch (StoreServerException e) {
			logger.error("Unable to initiate purchase ", e);
			return webUtils.obtainJSONFromObject(webUtils.getPWAException(e));
		}
	}

	@RequestMapping(value = "/getpaymentmethods", method = RequestMethod.POST)
	@ResponseBody
	public String getPaymentMethods(@RequestBody Map<String, String> jsonRequestBody, HttpServletRequest request,
			HttpSession session, Device device) {

		try {
			return purchaseService.getPaymentMethodsResponse(jsonRequestBody, request, session, device);
		} catch (StoreServerException e) {
			logger.error("Unable to get payment methods", e);
			return webUtils.obtainJSONFromObject(webUtils.getPWAException(e));
		}
	}

	@RequestMapping(value = "/getcomborespafterpayment", method = RequestMethod.POST)
	@ResponseBody
	public String getComboRespAfterPayment(@RequestBody Map<String, String> jsonRequestBody, HttpServletRequest request,
			HttpSession session, Device device) {

		try {
			return purchaseService.getComboRespAfterPaymentResponse(jsonRequestBody, request, session, device);
		} catch (StoreServerException e) {
			logger.error("Unable to get payment confirmation response: ", e);
			return webUtils.obtainJSONFromObject(webUtils.getPWAException(e));
		}
	}

}
