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

import com.onmobile.rbt.pwa.services.ChartService;
import com.onmobile.rbt.pwa.services.MytunesService;
import com.onmobile.rbt.pwa.services.UtilityService;
import com.onmobile.rbt.pwa.utils.StoreServerException;
import com.onmobile.rbt.pwa.utils.WebUtilsInterface;

@Controller
public class ChartController {

	private static final Logger logger = LogManager.getLogger(ChartController.class);

	@Autowired
	MytunesService mytunesService;

	@Autowired
	ChartService chartService;

	@Autowired
	UtilityService utilService;

	@Autowired
	WebUtilsInterface webUtils;

	@RequestMapping("/getdynamicchartitems")
	@ResponseBody
	public String getDynamicChartItems(
			@RequestParam(value = "chartId", required = true) String chartId,
			@RequestParam(value = "offset", required = true) String offset,
			@RequestParam(value = "maxItems", required = true) String maxItems,
			@RequestParam(value = "contentLanguage", required = true) String contentLanguage,
			HttpServletRequest request, HttpSession session, Device device)
			throws StoreServerException {

		try {
			String dynamicChartContents = chartService.populateDynamicChartItems(request,
					session, device, chartId, offset, maxItems, contentLanguage);
			return dynamicChartContents;
		} catch (StoreServerException e) {
			String msg = webUtils.obtainJSONFromObject(e);
			logger.error("Unable to populate Dynamic Chart - Exception :" + msg);
			return msg;
		}
	}

	@RequestMapping("getchartitems")
	@ResponseBody
	public String getChartItems(@RequestParam(value = "chartId", required = true) String chartId,
			@RequestParam(value = "offset", required = true) String offset,
			@RequestParam(value = "maxItems", required = true) String maxItems,
			@RequestParam(value = "contentLanguage", required = false) String contentLanguage,
			@RequestParam(value = "browsingLanguage", required = false) String browsingLanguage,
			HttpServletRequest request, HttpSession session, Device device) {
		try {
			return chartService.getChartItems(request, session, device, chartId, offset,
					maxItems, contentLanguage, browsingLanguage);
		} catch (StoreServerException e) {
			String msg = webUtils.obtainJSONFromObject(e);
			logger.error("Unable to populate Chart for ChartId:" + chartId + " Exception :" + msg);
			return msg;
		}
	}

	@RequestMapping("/getrecommendations")
	@ResponseBody
	public String getRecommendations(
			@RequestParam(value = "contentId", required = true) String contentId,
			@RequestParam(value = "albumName", required = true) String albumName,
			@RequestParam(value = "offset", required = true) String offset,
			@RequestParam(value = "maxCount", required = true) String maxCount,
			HttpServletRequest request, HttpSession session, Device device) {
		logger.info("In ChartController::getRecommendations()");
		try {
			return chartService.getContentRecommendations(contentId, albumName, offset,
					maxCount, request, session, device);
		} catch (StoreServerException e) {
			return webUtils.obtainJSONFromObject(e);
		}
	}

	@RequestMapping("/getmulticontentrecommendations")
	@ResponseBody
	public String getMultiContentRecommendations(
			@RequestParam(value = "contentIds", required = false) String contentIds,
			@RequestParam(value = "offset", required = true) String offset,
			@RequestParam(value = "maxCount", required = true) String maxCount,
			@RequestParam(value = "albumName", required = false) String albumName,
			@RequestParam(value = "language", required = false) String language,
			HttpServletRequest request, HttpSession session, Device device) {
		logger.info("In ChartController::getMultiContentRecommendations()");
		try {
			return chartService.getMultiContentRecommendations(contentIds, offset, maxCount, albumName, language , request, session, device);
		} catch (StoreServerException e) {
			return webUtils.obtainJSONFromObject(e);
		}
	}

}
