package com.onmobile.rbt.pwa.controllers;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

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

		} catch (StoreServerException storeException) {
			String exceptionObj = webUtils.obtainJSONFromObject(storeException);
			return exceptionObj;

		}
	}

	@RequestMapping("/getcategorisedsearchresults")
	@ResponseBody
	public String getCategorisedSearchResults(
			@RequestParam(value = "searchQuery", required = true) String searchString,
			@RequestParam(value = "genre", required = true) String genre,
			@RequestParam(value = "offset", required = true) String offset,
			@RequestParam(value = "maxItems", required = false) String maxItems,
			@RequestParam(value = "contentLanguage", required = true) String contentLanguage,
			@RequestParam(value = "isRTContent", required = true) boolean isRTContent,
			HttpServletRequest request, HttpSession session, Device device) {
		try {
			return searchService.getCategorisedSearchResults(searchString, genre, offset,
					maxItems, contentLanguage, isRTContent, request, session, device);

		} catch (StoreServerException storeException) {
			String exceptionObj = webUtils.obtainJSONFromObject(storeException);
			return exceptionObj;

		}
	}
}
