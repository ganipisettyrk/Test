package com.onmobile.rbt.pwa.utils;

import java.lang.reflect.Type;

import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;

import com.google.gson.FieldNamingPolicy;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.onmobile.rbt.pwa.utils.ErrorHandling.PWAException;

public class WebUtilsImpl implements WebUtilsInterface {

	@Autowired
	ApplicationResourceInterface applicationResource;

	private static String CATALOG_URL = null;
	private static String STORE_URL = null;
	private static String NOTIFICATION_URL = null;

	public String obtainJSONFromObject(Object obj) {
		return getGson().toJson(obj);
	}

	public String obtainJSONStringFromObject(Object obj) {
		return getGsonWithFieldNamePolicy().toJson(obj);
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	public Object fromJson(String json, Class t) {
		return getGson().fromJson(json, t);
	}

	public <T> T fromJsonToType(String json, Class<T> typeOfT) {
		return (T) getGson().fromJson(json, typeOfT);
	}

	public <T> T fromJsonToType(String json, Type type) {
		return getGson().fromJson(json, type);
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	public Object fromStringToObject(String str, Class t) {
		return getGsonWithFieldNamePolicy().fromJson(str, t);
	}

	private Gson getGson() {

		String dateFormat = applicationResource.getParameter(null, "pwa.gson.date.format");
		Gson gson = new GsonBuilder().setDateFormat(dateFormat).disableHtmlEscaping().create();
		return gson;
	}

	private Gson getGsonWithFieldNamePolicy() {

		String dateFormat = applicationResource.getParameter(null, "pwa.gson.date.format");
		Gson gsonWithFieldNamePolicy = new GsonBuilder().setDateFormat(dateFormat).disableHtmlEscaping()
				.setFieldNamingPolicy(FieldNamingPolicy.LOWER_CASE_WITH_UNDERSCORES)
				.registerTypeAdapterFactory(new LowercaseEnumTypeAdapterFactory()).create();
		return gsonWithFieldNamePolicy;
	}

	public String getUpdatedVoltronUrl(HttpSession session, String url) {

		if (null == CATALOG_URL) {
			CATALOG_URL = applicationResource.getParameter(session, "pwa.voltron.catalog.baseurl");
		}
		if (null == STORE_URL) {
			STORE_URL = applicationResource.getParameter(session, "pwa.voltron.store.baseurl");
		}

		if (null == NOTIFICATION_URL) {
			NOTIFICATION_URL = applicationResource.getParameter(session, "pwa.voltron.notification.baseurl");
		}
		if (null != url) {
			if (url.contains("%CATALOG_URL%") && null != CATALOG_URL) {
				url = url.replace("%CATALOG_URL%", CATALOG_URL);

			}
			if (url.contains("%STORE_URL%") && null != STORE_URL) {
				url = url.replace("%STORE_URL%", STORE_URL);
			}

			if (url.contains("%NOTIFICATION_URL%") && null != NOTIFICATION_URL) {
				url = url.replace("%NOTIFICATION_URL%", NOTIFICATION_URL);
			}
		}
		return url;

	}

	public PWAException getPWAException(StoreServerException e) {

		PWAException pwaEx = new PWAException();
		pwaEx.setCode(e.getCode());
		pwaEx.setSubCode(e.getSubCode());
		pwaEx.setDescription(e.getDescription());

		return pwaEx;

	}

}
