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
import com.onmobile.rbt.pwa.utils.StoreServerException;
import com.onmobile.rbt.pwa.utils.WebUtilsInterface;

@Controller
public class ChartController {

	private static final Logger logger = LogManager.getLogger(ChartController.class);

	@Autowired
	ChartService chartService;

	@Autowired
	WebUtilsInterface webUtils;

	@RequestMapping("/getdynamicchartitems")
	@ResponseBody
	public String getDynamicChartItems(@RequestParam(value = "chartId", required = true) Integer chartIdIntVal,
			@RequestParam(value = "offset", required = true) Integer offsetIntVal,
			@RequestParam(value = "maxItems", required = true) Integer maxItemsIntVal,
			@RequestParam(value = "contentLanguage", required = true) String contentLanguage,
			HttpServletRequest request, HttpSession session, Device device) throws StoreServerException {

		try {
			String dynamicChartContents = chartService.populateDynamicChartItems(request, session, device,
					chartIdIntVal, offsetIntVal, maxItemsIntVal, contentLanguage);
			return dynamicChartContents;
		} catch (StoreServerException e) {
			logger.error("Unable to populate Dynamic Chart - Exception :", e);
			return webUtils.obtainJSONFromObject(webUtils.getPWAException(e));
		}
	}

	@RequestMapping("getchartitems")
	@ResponseBody
	public String getChartItems(@RequestParam(value = "chartId", required = true) Integer chartIdIntVal,
			@RequestParam(value = "offset", required = true) Integer offsetIntVal,
			@RequestParam(value = "maxItems", required = true) Integer maxItemsIntVal,
			@RequestParam(value = "contentLanguage", required = false) String contentLanguage,
			@RequestParam(value = "browsingLanguage", required = false) String browsingLanguage,
			HttpServletRequest request, HttpSession session, Device device) {
		try {
			return chartService.getChartItems(request, session, device, chartIdIntVal, offsetIntVal, maxItemsIntVal,
					contentLanguage, browsingLanguage);
		} catch (StoreServerException e) {
			logger.error("Unable to populate Chart for ChartId:" + chartIdIntVal + ", Exception :", e);
			return webUtils.obtainJSONFromObject(webUtils.getPWAException(e));
		}
	}

	@RequestMapping("/getrecommendations")
	@ResponseBody
	public String getRecommendations(@RequestParam(value = "contentId", required = true) Integer contentIdIntVal,
			@RequestParam(value = "albumName", required = true) String albumName,
			@RequestParam(value = "offset", required = true) Integer offsetIntVal,
			@RequestParam(value = "maxCount", required = true) Integer maxCountIntVal, HttpServletRequest request,
			HttpSession session, Device device) {
		logger.info("In ChartController::getRecommendations()");
		try {
			return chartService.getContentRecommendations(contentIdIntVal, albumName, offsetIntVal, maxCountIntVal,
					request, session, device);
		} catch (StoreServerException e) {
			logger.error("Unable get recommendations for contentId " + contentIdIntVal + ", Exception :", e);
			return webUtils.obtainJSONFromObject(webUtils.getPWAException(e));
		}
	}

	@RequestMapping("/getmulticontentrecommendations")
	@ResponseBody
	public String getMultiContentRecommendations(
			@RequestParam(value = "contentIds", required = false) String contentIds,
			@RequestParam(value = "offset", required = true) Integer offsetIntVal,
			@RequestParam(value = "maxCount", required = true) Integer maxCountIntVal,
			@RequestParam(value = "albumName", required = false) String albumName,
			@RequestParam(value = "language", required = false) String language, HttpServletRequest request,
			HttpSession session, Device device) {
		logger.info("In ChartController::getMultiContentRecommendations()");
		try {
			return chartService.getMultiContentRecommendations(contentIds, offsetIntVal, maxCountIntVal, albumName,
					language, request, session, device);
		} catch (StoreServerException e) {
			logger.error("Unable get recommendations for contentIds " + contentIds + ", Exception :", e);
			return webUtils.obtainJSONFromObject(webUtils.getPWAException(e));
		}
	}

}
