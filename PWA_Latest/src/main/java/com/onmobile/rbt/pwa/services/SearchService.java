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
public class SearchService implements WebConstants {

	private static final Logger logger = LogManager.getLogger(SearchService.class);

	@Autowired
	UtilityService utilService;

	@Autowired
	ChartService chartService;

	@Autowired
	ApplicationResourceInterface applicationResource;

	@Autowired
	VoltronInterface voltronInterface;

	@Autowired
	WebUtilsInterface webUtils;

	public String getSearchTags(String browsingLanguage, HttpServletRequest request, HttpSession session, Device device)
			throws StoreServerException {
		logger.info("SearchService: getSearchTags()...");

		String url = applicationResource.getParameter(session, "pwa.search.tags.url");
		String max = applicationResource.getParameter(session, "pwa.max.search.tags", "10");
		String storeId = utilService.getStoreId(request, session, device);

		url = url.replace("%STORE_ID%", storeId);
		url = url.replace("%MAX_TAGS%", max);

		if (null != browsingLanguage) {
			browsingLanguage = "userLanguage=" + browsingLanguage;
		}

		url = url.replace("%BROWSING_LANGUAGE%", browsingLanguage);
		url = webUtils.getUpdatedVoltronUrl(session, url);

		logger.info("Going to hit search tags url: " + url);
		String tagsJson = null;
		try {
			tagsJson = voltronInterface.hitVoltronAPI(session, url, REQUEST_GET, null, String.class);
		} catch (StoreServerException storeException) {
			logger.error("Error while getting search tags, " + storeException);
			throw storeException;
		}
		return tagsJson;
	}

	public String getCategorisedSearchResults(String searchString, String genre,
			String offset, String maxItems, String contentLanguage, boolean isRTContent, 
			HttpServletRequest request, HttpSession session, Device device)
			throws StoreServerException {
		logger.info("SearchService: getCategorisedSearchResults(), genre: " + genre);
		String storeId = utilService.getStoreId(request, session, device);
		String url = applicationResource.getParameter(session, "pwa.categorised.search.url");
		int songResultSize = applicationResource.getIntParameter(session, "pwa.max.tunes.search.results", 3);
		int artistResultSize = applicationResource.getIntParameter(session, "pwa.max.artist.search.results", 2);
		int albumResultSize = applicationResource.getIntParameter(session, "pwa.max.album.search.results", 2);

		if (null == offset || offset.isEmpty()) {
			offset = "0";
		}

		url = url.replace("%STORE_ID%", storeId);
		url = url.replace("%SEARCH_STRING%", searchString);
		url = url.replace("%CATEGORY_TYPE%", genre);
		url = webUtils.getUpdatedVoltronUrl(session, url);

		if (genre.equals("all")) {
			url = url.replace("%RESULTSET_SIZE%", songResultSize + "|" + artistResultSize + "|" + albumResultSize);
		} else {
			url = url.replace("&resultset_size_max=%RESULTSET_SIZE%", "");
			url = url.replace("resultset_size_max=%RESULTSET_SIZE%", "");
			url += "&max=" + maxItems;
		}
		if (null != contentLanguage) {
			contentLanguage = "language=" + contentLanguage.replace(",", "&language=");
		}

		url = url.replace("%CONTENT_LANGUAGE%", contentLanguage);
		url += "&offset=" + offset;
		if (isRTContent) {
			url += "&itemType=realtone";
		}
		logger.info("Going to hit search url: " + url);

		String searchJson = null;
		try {
			searchJson = voltronInterface.hitVoltronAPI(session, url, REQUEST_GET, null, String.class);
		} catch (StoreServerException storeException) {
			logger.error("Error while getting categorised search results, " + storeException);
			throw storeException;
		}

		return searchJson;
	}

}
