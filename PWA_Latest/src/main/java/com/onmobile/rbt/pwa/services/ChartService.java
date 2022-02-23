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
public class ChartService implements WebConstants {
	private static final Logger logger = LogManager.getLogger(ChartService.class);

	@Autowired
	UtilityService utilService;

	@Autowired
	ApplicationResourceInterface applicationResource;

	@Autowired
	WebUtilsInterface webUtils;

	@Autowired
	VoltronInterface voltronInterface;

	public String populateDynamicChartItems(HttpServletRequest request,
			HttpSession session, Device device, Integer chartIdIntVal,
			Integer offsetIntVal, Integer maxItemsIntVal, String contentLanguage)
			throws StoreServerException {
		logger.info("Inside ChartService: populateDynamicChartItems()...");
		String storeId = utilService.getStoreId(request, session, device);
		String url = applicationResource.getParameter(session, "pwa.dynamic.chart.url");
		boolean isMobile = utilService.isAcessedFromMobileDevice(device);
		String imageWidth = null;
		if (isMobile) {
			imageWidth = applicationResource.getParameter(session, "pwa.dynamic.chart.image.width.for.mobile");
		} else {
			imageWidth = applicationResource.getParameter(session, "pwa.dynamic.chart.image.width.for.desktop");
		}

		String chartId = Integer.toString(chartIdIntVal);
		String offset = Integer.toString(offsetIntVal);
		String maxItems = Integer.toString(maxItemsIntVal);
		
		url = url.replace("%STORE_ID%", storeId);
		url = url.replace("%CHART_ID%", chartId);
		url = url.replace("%OFFSET%", offset);
		url = url.replace("%MAX_COUNT%", maxItems);
		url = url.replace("%CONTENT_LANGUAGE%", contentLanguage);
		if (null != imageWidth) {
			url = url.replace("%IMAGE_WIDTH%", imageWidth);
		}
		url = webUtils.getUpdatedVoltronUrl(session, url);

		logger.info("Retreiving dynamic chart content with url: " + url);
		String chartItems = voltronInterface.hitVoltronAPI(session, url, REQUEST_GET, null, String.class);
		logger.info("Response from dynamic chart content url: " + chartItems);
		return chartItems;
	}

	public String getChartItems(HttpServletRequest request, HttpSession session,
			Device device, Integer chartIdIntVal, Integer offsetIntVal,
			Integer maxItemsIntVal, String contentLanguage, String browsingLanguage)
			throws StoreServerException {
		logger.info("Inside ChartService: getChartItems()...");
		String url = applicationResource.getParameter(session, "pwa.chart.url");
		String storeId = utilService.getStoreId(request, session, device);

		boolean isMobile = utilService.isAcessedFromMobileDevice(device);
		String imageWidth = null;
		if (isMobile) {
			imageWidth = applicationResource.getParameter(session, "pwa.chart.image.width.for.mobile");
		} else {
			imageWidth = applicationResource.getParameter(session, "pwa.chart.image.width.for.desktop");
		}
		
		String chartId = Integer.toString(chartIdIntVal);
		String offset = Integer.toString(offsetIntVal);
		String maxItems = Integer.toString(maxItemsIntVal);
		
		url = url.replace("%CHART_ID%", chartId);
		url = url.replace("%STORE_ID%", storeId);
		if (null != imageWidth) {
			url = url.replace("%IMAGE_WIDTH%", imageWidth);
		}

		if (null != contentLanguage && !contentLanguage.isEmpty()) {
			url += "&chartLanguages=" + contentLanguage;
		}
		if (null != browsingLanguage && !browsingLanguage.isEmpty()) {
			url += "&userLanguage=" + browsingLanguage;
		}

		url = url.replace("%MAX_COUNT%", maxItems);
		url = url.replace("%OFFSET%", offset);
		url = webUtils.getUpdatedVoltronUrl(session, url);

		logger.info("Retreiving chart with ID: " + chartId + ", by hitting the URL: " + url);
		String chartItems = voltronInterface.hitVoltronAPI(session, url, REQUEST_GET, null, String.class);

		return chartItems;
	}

	public String getContentRecommendations(Integer contentIdIntVal, String albumName,
			Integer offsetIntVal, Integer maxCountIntVal, HttpServletRequest request,
			HttpSession session, Device device) throws StoreServerException {
		logger.info("Inside ChartService::getContentRecommendations()");

		String recommendations = null;
		boolean isMobile = utilService.isAcessedFromMobileDevice(device);
		String imageWidth = null;
		if (isMobile) {
			imageWidth = applicationResource.getParameter(session, "pwa.chart.image.width.for.mobile");
		} else {
			imageWidth = applicationResource.getParameter(session, "pwa.chart.image.width.for.desktop");
		}
		
		String contentId = Integer.toString(contentIdIntVal);
		String offset = Integer.toString(offsetIntVal);
		String maxCount = Integer.toString(maxCountIntVal);
		
		String url = applicationResource.getParameter(session, "pwa.recommendation.url");
		url = url.replace("%STORE_ID%", utilService.getStoreId(request, session, device));
		url = url.replace("%ALBUM_NAME%", albumName);
		url = url.replace("%CONTENT_ID%", contentId);
		if (null != imageWidth) {
			url = url.replace("%IMAGE_WIDTH%", imageWidth);
		}
		url = url.replace("%OFFSET%", offset);
		url = url.replace("%MAX_COUNT%", maxCount);
		String msisdn = utilService.getMsisdn(request, device);
		if (msisdn != null && !msisdn.isEmpty()) {
			String userId = utilService.getUserId(request, session, device);
			if (userId != null) {
				url += "&userId=" + userId;
			}
		}
		url = webUtils.getUpdatedVoltronUrl(session, url);

		logger.info("Retreiving content recommendation chart with URL: " + url);

		try {
			recommendations = voltronInterface.hitVoltronAPI(session, url, REQUEST_GET,
					null, String.class);
		} catch (StoreServerException e) {
			logger.info("Exception while retreiving prebuy recommendation chart " + e);
			throw e;
		}
		logger.info("Response from recommendation chart url: " + recommendations);
		return recommendations;
	}

	public String getMultiContentRecommendations(String contentIds, Integer offsetIntVal,
			Integer maxCountIntVal, String albumName, String contentLanguage,
			HttpServletRequest request, HttpSession session, Device device)
			throws StoreServerException {

		logger.info("Inside ChartService::getMultiContentRecommendations()");

		String recommendations = null;
		String url = applicationResource.getParameter(session, "pwa.multi.content.recommendation.url");
		boolean isMobile = utilService.isAcessedFromMobileDevice(device);
		String imageWidth = null;
		if (isMobile) {
			imageWidth = applicationResource.getParameter(session, "pwa.chart.image.width.for.mobile");
		} else {
			imageWidth = applicationResource.getParameter(session, "pwa.chart.image.width.for.desktop");
		}

		url = url.replace("%STORE_ID%", utilService.getStoreId(request, session, device));
		if (null != imageWidth) {
			url = url.replace("%IMAGE_WIDTH%", imageWidth);
		}
		
		String offset = Integer.toString(offsetIntVal);
		String maxCount = Integer.toString(maxCountIntVal);
		
		url = url.replace("%OFFSET%", offset);
		url = url.replace("%MAX_COUNT%", maxCount);
		url = webUtils.getUpdatedVoltronUrl(session, url);

		if (albumName != null) {
			url += "&recValue=" + albumName;
		}

		if (null != contentLanguage) {
			contentLanguage = "&language=" + contentLanguage.replace(",", "&language=");
			url += contentLanguage;
		}

		if (null != contentIds) {
			contentIds = "&contentId=" + contentIds.replace(",", "&contentId=");
			url += contentIds;
		}

		String msisdn = utilService.getMsisdn(request, device);
		if (msisdn != null && !msisdn.isEmpty()) {
			String userId = utilService.getUserId(request, session, device);
			if (userId != null) {
				url += "&userId=" + userId;
			}
		}

		logger.info("Retreiving multi content recommendation chart with URL: " + url);
		try {
			recommendations = voltronInterface.hitVoltronAPI(session, url, REQUEST_GET,
					null, String.class);
		} catch (StoreServerException e) {
			logger.info("Exception while retreiving prebuy recommendation chart " + e);
			throw e;
		}
		logger.info("Response from multi content recommendation chart URL: " + recommendations);
		return recommendations;
	}

}
