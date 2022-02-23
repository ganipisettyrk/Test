package com.onmobile.rbt.pwa.config;

import java.util.Enumeration;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

@Component
public class CustomHttpRequestInterceptor implements HandlerInterceptor {

	public String maxUrlLen = null;

	public CustomHttpRequestInterceptor() {

	}

	public CustomHttpRequestInterceptor(String maxUrlLen) {
		this.maxUrlLen = maxUrlLen;
	}

	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
			throws Exception {

		Enumeration<String> parameterNames = request.getParameterNames();
		while (parameterNames.hasMoreElements()) {
			int length;
			if (this.maxUrlLen != null) {
				length = Integer.parseInt(this.maxUrlLen);
			} else {
				length = 40;
			}
			String key = (String) parameterNames.nextElement();
			String value = request.getParameter(key);

			if (value.length() > length || value.contains("script")) {
				return false;
			}
		}
		return true;
	}

	@Override
	public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler,
			ModelAndView modelAndView) throws Exception {

	}

	@Override
	public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler,
			Exception exception) throws Exception {

	}
}