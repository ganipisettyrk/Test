package com.onmobile.rbt.pwa.utils;

import javax.servlet.http.HttpSession;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;

public interface VoltronInterface {

	public <T> T hitVoltronAPI(HttpSession session, String URL, String requestMethod,
			Object obj, Class<T> T) throws StoreServerException;
	
	public <T> T hitVoltronAPI(HttpSession session, String URL, String requestMethod,
			Object obj, Class<T> T, boolean encodingRequired) throws StoreServerException;
	
	public <T> T hitVoltronAPI(HttpSession session, String URL, String requestMethod,
			Object obj, Class<T> T, String headerKey, String headerValue, String portKey,
			String portNum, boolean encodingRequired) throws StoreServerException;

	public HttpStatus getStatusCodeFromVoltronAPI(HttpSession session, String url,
			HttpMethod requestMethod, HttpEntity<?> requestEntity, Class<String> T)
			throws StoreServerException;

}
