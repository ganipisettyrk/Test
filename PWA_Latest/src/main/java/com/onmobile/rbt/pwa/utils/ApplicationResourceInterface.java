package com.onmobile.rbt.pwa.utils;

import java.util.Locale;
import java.util.Map;

import javax.servlet.http.HttpSession;

public interface ApplicationResourceInterface {

	public String getParameter(HttpSession session, String paramName, String defaultValue);

	public String getParameter(HttpSession session, String paramName);

	public int getIntParameter(HttpSession session, String paramName, int defaultValue);

	public boolean contains(HttpSession session, String paramName);

	public Map<String, String> getMessageBundle(final Locale locale);

}
