package com.onmobile.rbt.pwa.utils;

import java.nio.charset.StandardCharsets;
import java.util.List;

import javax.servlet.http.HttpSession;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.DefaultUriBuilderFactory;
import org.springframework.web.util.DefaultUriBuilderFactory.EncodingMode;

import com.fasterxml.jackson.databind.SerializationFeature;
import com.onmobile.rbt.pwa.beans.CatalogErrorBean;
import com.onmobile.rbt.pwa.beans.ExceptionBean;

public class VoltronInterfaceImpl implements VoltronInterface, WebConstants {

	@Autowired
	ApplicationResourceInterface applicationResource;

	@Autowired
	WebUtilsInterface webUtils;

	private static final Logger logger = LogManager.getLogger(VoltronInterfaceImpl.class);

	public <T> T hitVoltronAPI(HttpSession session, String URL, String requestMethod,
			Object obj, Class<T> T) throws StoreServerException {
		return hitVoltronAPI(session, URL, requestMethod, obj, T, true);
	}

	public <T> T hitVoltronAPI(HttpSession session, String URL, String requestMethod,
			Object obj, Class<T> T, boolean encodingRequired) throws StoreServerException {
		return hitVoltronAPI(session, URL, requestMethod, obj, T, null, null, null, null,
				encodingRequired);
	}
	
	public <T> T hitVoltronAPI(HttpSession session, String URL, String requestMethod,
			Object obj, Class<T> T, String headerKey, String headerValue, String portKey,
			String portNum, boolean encodingRequired) throws StoreServerException {
		RestTemplate restTemplate = new RestTemplate();
		try {
			if (REQUEST_GET.equalsIgnoreCase(requestMethod)) {
				if (!encodingRequired) {
					DefaultUriBuilderFactory factory = new DefaultUriBuilderFactory();
					factory.setEncodingMode(DefaultUriBuilderFactory.EncodingMode.NONE);
					restTemplate.setUriTemplateHandler(factory);
				}
				restTemplate.getMessageConverters().add(0, new StringHttpMessageConverter(StandardCharsets.UTF_8));
				return restTemplate.getForObject(URL, T);
			} else if (REQUEST_POST.equalsIgnoreCase(requestMethod)) {

				MultiValueMap<String, String> headers = new LinkedMultiValueMap<String, String>();
				headers.add("Content-Type", "application/json");
				if (null != headerKey && null != headerValue) {
					headers.add(headerKey, headerValue);
				}
				if (null != portKey && null != portNum) {
					headers.add(portKey, portNum);
				}
				if (obj == null) {
					HttpEntity<String> httpEntity = new HttpEntity<String>(headers);
					return restTemplate.postForObject(URL, httpEntity, T);
				} else {
					MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
					converter.setDefaultCharset(StandardCharsets.UTF_8);
					converter.getObjectMapper().disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

					restTemplate.getMessageConverters().add(converter);
					restTemplate.getMessageConverters().add(0, new StringHttpMessageConverter(StandardCharsets.UTF_8));

					HttpEntity<Object> request = new HttpEntity<Object>(obj, headers);

					return restTemplate.postForObject(URL, request, T);
				}
			}
		} catch (HttpClientErrorException e) {
			handleHttpClientException(session, e);
		} catch (HttpServerErrorException e) {
			generateHttpServerException(session, e);
		}
		return null;
	}

	private StoreServerException getErrorDescription(HttpSession session, String errorResponse) {
		ExceptionBean errorResp = (ExceptionBean) webUtils.fromJson(errorResponse, ExceptionBean.class);

		String errorCode = null;
		String errorDesc = null;
		StoreServerException serverException = new StoreServerException();
		if (null != errorResp.getErrors()) {
			List<CatalogErrorBean> catalogError = errorResp.getErrors();
			if (catalogError.size() > 0) {
				errorCode = catalogError.get(0).getCode();
				serverException.setCode(errorCode);
			}
		} else {
			errorCode = errorResp.getSub_code();
			if (null == errorCode || errorCode.equalsIgnoreCase("NA")) {
				errorCode = errorResp.getCode();
			}
			serverException.setCode(errorResp.getCode());
			serverException.setSubCode(errorResp.getSub_code());
		}

		if (null != errorCode) {
			String errorPropertyName = errorCode + ".label";
			errorDesc = applicationResource.getParameter(session, errorPropertyName);
		}

		if (null == errorDesc) {
			errorDesc = applicationResource.getParameter(session, "pwa.default.error.description");
		}

		serverException.setDescription(errorDesc);

		return serverException;
	}

	public HttpStatus getStatusCodeFromVoltronAPI(HttpSession session, String url, HttpMethod requestMethod,
			HttpEntity<?> requestEntity, Class<String> T) throws StoreServerException {
		RestTemplate restTemplate = new RestTemplate();
		ResponseEntity<String> response = null;

		try {
			response = restTemplate.exchange(url, requestMethod, requestEntity, T);
			return response.getStatusCode();
		} catch (HttpClientErrorException e) {
			handleHttpClientException(session, e);
		} catch (HttpServerErrorException e) {
			generateHttpServerException(session, e);
		}
		return null;
	}

	private void generateHttpServerException(HttpSession session, HttpServerErrorException e)
			throws StoreServerException {
		logger.info("Server Error response::: " + e.getResponseBodyAsString());
		StoreServerException serverException = null;
		serverException = getErrorDescription(session, e.getResponseBodyAsString());

		throw serverException;
	}

	private void handleHttpClientException(HttpSession session, HttpClientErrorException e)
			throws StoreServerException {
		logger.info("Client Error response::: " + e.getResponseBodyAsString());
		StoreServerException serverException = null;
		serverException = getErrorDescription(session, e.getResponseBodyAsString());

		throw serverException;
	}

}
