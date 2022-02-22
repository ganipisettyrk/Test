package com.onmobile.rbt.pwa.utils;

import java.lang.reflect.Type;

import javax.servlet.http.HttpSession;

public interface WebUtilsInterface {

	public String obtainJSONFromObject(Object obj);

	public String obtainJSONStringFromObject(Object obj);

	public Object fromJson(String json, Class t);

	public Object fromStringToObject(String str, Class t);

	public String getUpdatedVoltronUrl(HttpSession session, String url);
	
	public <T> T fromJsonToType(String json, Class<T> typeOfT);
	
	public <T> T fromJsonToType(String json, Type typeOfT);

}
