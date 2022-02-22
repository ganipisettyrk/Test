package com.onmobile.rbt.pwa.controllers;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mobile.device.Device;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.onmobile.rbt.pwa.services.NametunesService;
import com.onmobile.rbt.pwa.utils.StoreServerException;
import com.onmobile.rbt.pwa.utils.WebUtilsInterface;

@Controller
public class NametunesController {

	private static final Logger logger = LogManager.getLogger(NametunesController.class);

	@Autowired
	NametunesService nameTunesService;
	@Autowired
	WebUtilsInterface webUtils;

	@RequestMapping("/getnametunes")
	@ResponseBody
	public String getNametunes(@RequestParam(value = "nameTune", required = true) String nameTune,
			@RequestParam(value = "maxItems", required = true) String maxItems,
			@RequestParam(value = "offset", required = true) String offset,
			@RequestParam(value = "type", required = true) String type, HttpServletRequest request,
			HttpSession session, Device device) {

		try {
			return nameTunesService.getNametunes(nameTune, maxItems, offset, type, request, session, device);
		} catch (StoreServerException storeException) {

			String exceptionObj = webUtils.obtainJSONFromObject(storeException);
			logger.error("Unable to get Nametunes for :" + nameTune + " Exception - " + exceptionObj);

			return exceptionObj;
		}
	}

	@RequestMapping(value = "/createnametune", method = RequestMethod.POST)
	@ResponseBody
	public String createNametune(@RequestParam(value = "nameTune", required = true) String nameTune,
			@RequestParam(value = "type", required = true) String type,
			HttpServletRequest request, HttpSession session, Device device) {

		try {
			return nameTunesService.createNametunes(nameTune, type, request, session, device);
		} catch (StoreServerException storeException) {
			String exceptionObj = webUtils.obtainJSONFromObject(storeException);
			logger.error("Unable to create Nametunes for :" + nameTune + " Exception - " + exceptionObj);

			return exceptionObj;
		}
	}

}
