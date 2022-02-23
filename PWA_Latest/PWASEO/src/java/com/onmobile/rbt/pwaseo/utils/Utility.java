package com.onmobile.rbt.pwaseo.utils;

import java.nio.charset.StandardCharsets;

import org.springframework.http.HttpEntity;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.SerializationFeature;
import com.google.gson.FieldNamingPolicy;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

public class Utility {

	public static final String REQUEST_GET = "GET";
	public static final String REQUEST_POST = "POST";

	@SuppressWarnings({ "unchecked", "rawtypes" })
	public static Object fromStringToObject(String str, Class t) {
		return getGsonWithFieldNamePolicy().fromJson(str, t);
	}

	private static Gson getGsonWithFieldNamePolicy() {

		Gson gsonWithFieldNamePolicy = new GsonBuilder().disableHtmlEscaping()
				.setFieldNamingPolicy(FieldNamingPolicy.LOWER_CASE_WITH_UNDERSCORES)
				.registerTypeAdapterFactory(new LowercaseEnumTypeAdapterFactory()).create();
		return gsonWithFieldNamePolicy;
	}

	public static <T> T hitVoltronAPI(String URL, String requestMethod, Object obj, Class<T> T)
			throws StoreServerException {
		return hitVoltronAPI(URL, requestMethod, obj, T, null, null);
	}

	public static <T> T hitVoltronAPI(String URL, String requestMethod, Object obj, Class<T> T, String headerKey,
			String headerValue) throws StoreServerException {
		RestTemplate restTemplate = new RestTemplate();
		try {
			if (REQUEST_GET.equalsIgnoreCase(requestMethod)) {
				restTemplate.getMessageConverters().add(0, new StringHttpMessageConverter(StandardCharsets.UTF_8));
				return restTemplate.getForObject(URL, T);
			} else if (REQUEST_POST.equalsIgnoreCase(requestMethod)) {

				MultiValueMap<String, String> headers = new LinkedMultiValueMap<String, String>();
				headers.add("Content-Type", "application/json");
				if (null != headerKey && null != headerValue) {
					headers.add(headerKey, headerValue);
				}
				if (obj == null) {
					HttpEntity<String> httpEntity = new HttpEntity<String>(headers);
					return restTemplate.postForObject(URL, httpEntity, T);
				} else {
					MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
					// converter.setDefaultCharset(StandardCharsets.UTF_8);
					converter.getObjectMapper().disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

					restTemplate.getMessageConverters().add(converter);
					restTemplate.getMessageConverters().add(0, new StringHttpMessageConverter(StandardCharsets.UTF_8));

					HttpEntity<Object> request = new HttpEntity<Object>(obj, headers);

					return restTemplate.postForObject(URL, request, T);
				}
			}
		} catch (HttpClientErrorException e) {
			// handleHttpClientException(session, e);
		} catch (HttpServerErrorException e) {
			// generateHttpServerException(session, e);
		}
		return null;
	}

}
