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

import com.onmobile.rbt.pwa.services.ContentService;
import com.onmobile.rbt.pwa.utils.StoreServerException;
import com.onmobile.rbt.pwa.utils.WebUtilsInterface;

@Controller
public class ContentController {

	private static final Logger logger = LogManager.getLogger(ContentController.class);

	@Autowired
	WebUtilsInterface webUtils;

	@Autowired
	ContentService contentService;

	@RequestMapping("/getcontent")
	@ResponseBody
	public String getContentMetadata(
			@RequestParam(value = "contentId", required = true) String contentId,
			@RequestParam(value = "contentType", required = true) String contentType,
			@RequestParam(value = "paramType", required = false) String paramType,
			@RequestParam(value = "paramSubtype", required = false) String paramSubtype,
			@RequestParam(value = "browsingLanguage", required = true) String browsingLanguage,
			@RequestParam(value = "extMode", required = true) String extMode,
			@RequestParam(value = "showAvailability", required = true) String showAvailability,
			HttpServletRequest request, HttpSession session, Device device) {
		try {
			logger.info("In ContentController: getContentMetadata()...");
			return contentService.getContentMetadata(contentId, contentType, paramType,
					paramSubtype, browsingLanguage, extMode, showAvailability, request, session, device);
		} catch (StoreServerException e) {
			return webUtils.obtainJSONFromObject(e);
		}
	}

	@RequestMapping("/getbannercontent")
	@ResponseBody
	public String getBannerContentMetadata(
			@RequestParam(value = "contentId", required = true) String contentId,
			@RequestParam(value = "contentType", required = true) String contentType,
			@RequestParam(value = "browsingLanguage", required = true) String browsingLanguage,
			@RequestParam(value = "extMode", required = true) String extMode,
			@RequestParam(value = "showAvailability", required = true) String showAvailability,
			HttpServletRequest request, HttpSession session, Device device) {
		try {
			//This method is required as only banner contents are cached
			logger.info("In ContentController: getContentMetadata()...");
			return contentService.getContentMetadata(contentId, contentType, null,
					null, browsingLanguage, extMode, showAvailability, request, session, device);
		} catch (StoreServerException e) {
			return webUtils.obtainJSONFromObject(e);
		}
	}
}
