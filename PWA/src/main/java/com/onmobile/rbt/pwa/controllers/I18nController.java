package com.onmobile.rbt.pwa.controllers;

import java.util.Locale;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.google.gson.Gson;
import com.onmobile.rbt.pwa.services.UtilityService;
import com.onmobile.rbt.pwa.utils.ApplicationResourceInterface;
import com.onmobile.rbt.pwa.utils.WebConstants;

@Controller
public class I18nController implements WebConstants {
	@Autowired
	UtilityService utilService;

	@Autowired
	ApplicationResourceInterface applicationResource;

	private static final Logger logger = LogManager.getLogger(I18nController.class);

	@RequestMapping(value = "/messagebundle", method = RequestMethod.GET, produces = "application/json; charset=UTF-8")
	@ResponseBody
	public String getJsonLocale(@RequestParam(value = "browsingLanguage", required = false) String browsingLanguage,
			HttpServletRequest request, HttpSession session, ModelMap model) throws Exception {
		logger.info("Inside i18n controller..");

		if (null == browsingLanguage) {
			browsingLanguage = (String) session.getAttribute(BROWSING_LANGUAGE);
			if (null == browsingLanguage) {
				session.setAttribute(BROWSING_LANGUAGE, browsingLanguage);
			}
		} else {
			session.setAttribute(BROWSING_LANGUAGE, browsingLanguage);
		}

		Map<String, String> values = applicationResource.getMessageBundle(new Locale(browsingLanguage));

		Gson gson = new Gson();
		String propertyJson = gson.toJson(values);
		return propertyJson;

	}

}