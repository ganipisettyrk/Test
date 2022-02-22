package com.onmobile.rbt.pwa.controllers;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.onmobile.rbt.pwa.services.ConsentHandlingService;

@Controller
public class ConsentHandlingController {
	private static final Logger logger = LogManager.getLogger(ConsentHandlingController.class);

	@Autowired
	ConsentHandlingService consentService;

	@RequestMapping("/getconsentresp")
	@ResponseBody
	public String getConsentResponse(HttpServletRequest request, HttpSession session) throws Exception {
		logger.info("Inside ConsentHandlingController, getConsentResponse()...");
		return consentService.getConsentResponse(request, session);
	}
}
