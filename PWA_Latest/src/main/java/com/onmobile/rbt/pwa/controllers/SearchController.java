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

import com.onmobile.rbt.pwa.services.SearchService;
import com.onmobile.rbt.pwa.utils.StoreServerException;
import com.onmobile.rbt.pwa.utils.WebUtilsInterface;

@Controller
public class SearchController {

	private static final Logger logger = LogManager.getLogger(SearchController.class);

	@Autowired
	SearchService searchService;

	@Autowired
	WebUtilsInterface webUtils;

	@RequestMapping("/getsearchtags")
	@ResponseBody
	public String getSearchTags(@RequestParam(value = "browsingLanguage", required = true) String browsingLanguage,
			HttpServletRequest request, HttpSession session, Device device) {
		try {
			return searchService.getSearchTags(browsingLanguage, request, session, device);
		} catch (StoreServerException e) {
			logger.error("Unable to get search tags", e);
			return webUtils.obtainJSONFromObject(webUtils.getPWAException(e));
		}
	}

	@RequestMapping("/getcategorisedsearchresults")
	@ResponseBody
	public String getCategorisedSearchResults(@RequestParam(value = "searchQuery", required = true) String searchString,
			@RequestParam(value = "genre", required = true) String genre,
			@RequestParam(value = "offset", required = true) Integer offsetIntVal,
			@RequestParam(value = "maxItems", required = false) Integer maxItemsIntVal,
			@RequestParam(value = "contentLanguage", required = true) String contentLanguage,
			@RequestParam(value = "isRTContent", required = true) boolean isRTContent, HttpServletRequest request,
			HttpSession session, Device device) {
		try {
			String offset = offsetIntVal.toString();
			String maxItems = null;
			if (!genre.equals("all")) {
				maxItems = maxItemsIntVal.toString();
			}

			return searchService.getCategorisedSearchResults(searchString, genre, offset, maxItems, contentLanguage,
					isRTContent, request, session, device);

		} catch (StoreServerException e) {
			logger.error("Unable to get categorized search results", e);
			return webUtils.obtainJSONFromObject(webUtils.getPWAException(e));

		}
	}
}
