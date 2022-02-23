package com.onmobile.rbt.pwa.utils;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import javax.annotation.Resource;
import javax.servlet.http.HttpSession;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.MessageSource;

public class ApplicationResourceImpl implements ApplicationResourceInterface, WebConstants {
	private static final Logger logger = LogManager.getLogger(ApplicationResourceImpl.class);

	@Autowired
	@Qualifier("messageResourceBean")
	private MessageSource messageSource;

	@Resource(name = "defaultMessagesKeys")
	private List<String> defaultMessagesKeys;

	public Map<String, String> getMessageBundle(final Locale locale) {
		Map<String, String> bundleMap = defaultMessagesKeys.stream()
				.collect(Collectors.toMap(code -> code, code -> messageSource.getMessage(code, null, locale)));
		logger.debug("bundleMap : " + bundleMap);
		return bundleMap;

	}

	public boolean contains(HttpSession session, String paramName) {
		String paramValue = getParameter(session, paramName);
		if (null != paramValue) {
			return true;
		} else {
			return false;
		}
	}

	public String getParameter(HttpSession session, String code) {

		String key = null;
		String value = null;
		Object localeObj = null;
		boolean checkStore = false;
		if (null != session) {
			localeObj = session.getAttribute(BROWSING_LANGUAGE);
		}
		Locale locale = null;
		if (null != localeObj) {
			locale = new Locale((String) localeObj);
		}

		if (null != session) {
			checkStore = isStoreIdentificationRequired(session);
			if (checkStore) {
				String storeId = (String) session.getAttribute(STORE_ID);
				if (null == storeId || storeId.isEmpty()) {
					storeId = messageSource.getMessage("pwa.default.store.id", null, locale);
				}
				if (storeId != null) {
					storeId = (String) storeId;
					key = code + "." + storeId;
				} else {
					key = code;
				}
			} else {
				key = code;
			}
		} else {
			key = code;
		}

		try {
			value = messageSource.getMessage(key, null, locale);
		} catch (Exception e) {
			if (checkStore) {
				logger.info("Value not available for - " + key + ", checking without store");
				try {
					value = messageSource.getMessage(code, null, locale);
				} catch (Exception ex) {
					logger.error("Value not available for - " + code);
				}
			} else {
				logger.error("Value not available for - " + key);
			}
		}

		return value;

	}

	public boolean isStoreIdentificationRequired(HttpSession session) {

		Object value = session.getAttribute(IS_STORE_IDENTIFICATIONREQUIRED);

		if (null != value) {
			return (Boolean) value;
		} else {

			try {
				Object localeObj = session.getAttribute(BROWSING_LANGUAGE);

				Locale locale = null;
				if (null != localeObj) {
					locale = new Locale((String) localeObj);
				}

				String resultval = messageSource.getMessage("pwa.store.identification.required", null, locale);
				if (null != resultval) {

					boolean result = Boolean.parseBoolean(resultval);
					session.setAttribute(IS_STORE_IDENTIFICATIONREQUIRED, result);

					return result;

				}
			} catch (Exception e) {
				logger.error(e);
			}
		}

		return false;

	}

	public String getParameter(HttpSession session, String paramName, String defaultValue) {
		String paramValue = getParameter(session, paramName);
		if (null != paramValue) {
			return paramValue;
		} else {
			return defaultValue;
		}
	}

	public int getIntParameter(HttpSession session, String paramName, int defaultValue) {
		String paramValue = getParameter(session, paramName);
		if (null != paramValue) {
			return Integer.parseInt(paramValue);
		} else {
			return defaultValue;
		}
	}

}
