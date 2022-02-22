package com.onmobile.rbt.pwa.services;

import java.net.URLDecoder;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.mobile.device.Device;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.onmobile.encryptor.PasswordEncryptor;
import com.onmobile.rbt.pwa.beans.ContestDataBean;
import com.onmobile.rbt.pwa.beans.EventDataBean;
import com.onmobile.rbt.pwa.beans.PwaLaunchBean;
import com.onmobile.rbt.pwa.utils.ApplicationResourceInterface;
import com.onmobile.rbt.pwa.utils.OoredoOmanLogger;
import com.onmobile.rbt.pwa.utils.ResponseWrapper;
import com.onmobile.rbt.pwa.utils.StoreServerException;
import com.onmobile.rbt.pwa.utils.VoltronInterface;
import com.onmobile.rbt.pwa.utils.WebConstants;
import com.onmobile.rbt.pwa.utils.WebUtilsInterface;
import com.onmobile.rbt.pwa.utils.AESUtilities.OoredoAESUtils;
import com.onmobile.rbt.pwa.utils.ContestUtilities.ContestUtils;
import com.onmobile.rbt.pwa.utils.TokenUtilities.bean.CryptoPayloadDto;
import com.onmobile.store.storefront.dto.authentication.AuthenticationToken;

@Service
public class AuthenticationService implements WebConstants {
	private static final Logger logger = LogManager.getLogger(AuthenticationService.class);

	@Autowired
	FeatureService featureService;

	@Autowired
	UtilityService utilsService;

	@Autowired
	ApplicationResourceInterface applicationResource;

	@Autowired
	WebUtilsInterface webUtils;

	@Autowired
	VoltronInterface voltronInterface;

	public String generateOTP(String msisdn, String type, HttpServletRequest httpRequest, HttpSession session,
			Device device) throws StoreServerException {
		logger.info("AuthenticationService:: generateOTP()...");

		session.setAttribute(TEMPORARY_MSISDN, msisdn);
		session.setAttribute(WRONG_OTP_ATTEMPTS, null);

		String storeId = utilsService.getStoreIdWithStoreIdentification(type, httpRequest, session, device);
		if (storeId == null) {
			storeId = applicationResource.getParameter(session, "pwa.default.store.id");
			logger.info("StoreId from Default Config: " + storeId);
		} else {
			logger.info("StoreId from StoreIdentification: " + storeId);
		}

		session.setAttribute(TEMPORARY_MSISDN, null);
		session.setAttribute(STORE_ID_OTP_FLOW, storeId);

		String url = applicationResource.getParameter(session, "pwa.generate.otp.url");
		String otpLength = applicationResource.getParameter(session, "pwa.otp.max.length");
		String sqn = applicationResource.getParameter(session, "pwa.sqn.value");

		url = url.replace("%STORE_ID%", storeId);
		url = url.replace("%OTP_LENGTH%", otpLength);
		if (null != sqn) {
			url = url.replace("%SQN%", sqn);
		}
		url = webUtils.getUpdatedVoltronUrl(session, url);

		logger.info("Generating OTP for MSISDN : " + msisdn + " with URL : " + url);

		CryptoPayloadDto cryptoPayload = utilsService.generateRequestBody(msisdn, null, session, "generateOTP", null);
		HttpEntity<CryptoPayloadDto> request = new HttpEntity<CryptoPayloadDto>(cryptoPayload);
		HttpStatus statusCode = null;
		try {
			statusCode = voltronInterface.getStatusCodeFromVoltronAPI(session, url, HttpMethod.POST, request,
					String.class);
		} catch (StoreServerException storeException) {
			logger.info("Unable to generate OTP for MSISDN : " + msisdn);
			throw storeException;
		}

		ResponseWrapper responseWrapper = new ResponseWrapper();
		if (statusCode == HttpStatus.OK) {
			logger.info("OTP generated successfully for MSISDN : " + msisdn);
			responseWrapper.setResult(OTP_GENERATED);
			responseWrapper.setStatusCode(statusCode.value());
		} else {
			logger.info("Unable to generate OTP for MSISDN : " + msisdn);
			responseWrapper.setResult(OTP_NOT_GENERATED);
			responseWrapper.setStatusCode(statusCode.value());
		}
		String response = webUtils.obtainJSONFromObject(responseWrapper);
		return response;
	}

	public String validateOTP(String msisdn, String pin, HttpSession session, HttpServletRequest request, Device device)
			throws StoreServerException {

		logger.info("AuthenticationService:: validateOTP()...");
		String storeId = (String) session.getAttribute(STORE_ID_OTP_FLOW);
		ResponseWrapper responseWrapper = new ResponseWrapper();

		int wrongOTPAttempts;
		int maxWrongOTPAttempts = applicationResource.getIntParameter(session, "pwa.wrong.otp.attempts", 3);

		String url = applicationResource.getParameter(session, "pwa.validate.otp.url");

		url = url.replace("%STORE_ID%", storeId);
		url = webUtils.getUpdatedVoltronUrl(session, url);

		if (session.getAttribute(WRONG_OTP_ATTEMPTS) != null) {
			wrongOTPAttempts = (Integer) session.getAttribute(WRONG_OTP_ATTEMPTS);
		} else {
			wrongOTPAttempts = 0;
		}

		if (maxWrongOTPAttempts <= wrongOTPAttempts) {
			responseWrapper.setResult(WRONG_OTP_ATTEMPS_EXCEEDED);
			return webUtils.obtainJSONFromObject(responseWrapper);
		}
		logger.info("Validate OTP entered by MSISDN : " + msisdn + " with URL : " + url);

		AuthenticationToken authenticationToken = null;
		CryptoPayloadDto cryptoPayload = utilsService.generateRequestBody(msisdn, pin, session, "validateOTP", null);

		try {
			authenticationToken = voltronInterface.hitVoltronAPI(session, url, REQUEST_POST, cryptoPayload,
					AuthenticationToken.class);
		} catch (StoreServerException storeException) {

			logger.error("Exception while Validating OTP: ", storeException);
			if (storeException.getCode().equalsIgnoreCase("INVALID_PIN")) {
				session.setAttribute(WRONG_OTP_ATTEMPTS, wrongOTPAttempts + 1);
				responseWrapper.setResult(WRONG_OTP_ATTEMPTS);
				return webUtils.obtainJSONFromObject(responseWrapper);
			} else {
				return webUtils.obtainJSONFromObject(storeException);
			}
		}

		if (null != authenticationToken) {
			if (authenticationToken.getToken() != null || !authenticationToken.getToken().isEmpty()) {

				boolean validateHmac = utilsService.validateHmacResponse(authenticationToken.getToken(),
						authenticationToken.getHmac(), session);
				if (!validateHmac) {
					logger.info("Token validation failed");
					responseWrapper.setResult(INVALID_USER);
					return webUtils.obtainJSONFromObject(responseWrapper);
				}

				logger.info("User with MSISDN : " + msisdn + " authenticated successfully!!");
				session = utilsService.regenerateSession(request, session);
				session.setAttribute(MSISDN, msisdn);
				session.setAttribute(STORE_ID, storeId);
				session.setAttribute(TEMPORARY_MSISDN, null);
				session.setAttribute(AUTH_TOKEN, authenticationToken.getToken());
				session.setAttribute(REGISTERED, true);
				responseWrapper.setResult(VALID_USER);
				responseWrapper.setStoreId(storeId);
				String encryptedMsisdn = utilsService.getEncryptedMsisdn(msisdn, device);
				responseWrapper.setEncryptedMsisdn(encryptedMsisdn);
				responseWrapper = utilsService.updateUUIDInResponse(session, responseWrapper);
				return webUtils.obtainJSONFromObject(responseWrapper);
			}
			responseWrapper.setResult(INVALID_USER);
			return webUtils.obtainJSONFromObject(responseWrapper);
		}
		return null;
	}

	public String isUserLoggedIn(HttpServletRequest request, Device device) {
		logger.info("AuthenticationService:: isUserLoggedIn()...");

		boolean isUserLoggedInStatus = false;
		String msisdn = utilsService.getMsisdn(request, device);
		ResponseWrapper responseWrapper = new ResponseWrapper();

		if (msisdn != null && !msisdn.isEmpty()) {
			isUserLoggedInStatus = true;
		} else {
			String encryptedMsisdn = utilsService.getTefSpainSpecificEncryyptedMsisdn(request, device);
			if (null != encryptedMsisdn && !encryptedMsisdn.isEmpty()) {
				isUserLoggedInStatus = true;
				responseWrapper.setEncryptedMsisdn(encryptedMsisdn);
				responseWrapper = utilsService.updateUUIDInResponse(request.getSession(), responseWrapper);

			}
		}
		logger.info("isUserLoggedInStatus: " + isUserLoggedInStatus);

		responseWrapper.setLoggedIn(isUserLoggedInStatus);
		if (isUserLoggedInStatus) {
			boolean isHeaderUser = false;
			Object value = request.getSession().getAttribute(HEADERMSISDN);

			if (null != value) {
				isHeaderUser = (Boolean) value;
			}
			responseWrapper.setHeaderUser(isHeaderUser);
		}
		return webUtils.obtainJSONFromObject(responseWrapper);
	}

	public ResponseWrapper updateMsisdn(HttpServletRequest request, HttpSession session, Device device,
			String encryptedMsisdn, String tokenKey, boolean fromLocalStorage, String encryptedUUID) {
		logger.info("AuthenticationService:: updateMsisdn()...");

		String result = null;
		ResponseWrapper responseWrapper = new ResponseWrapper();
		// Only called from UI - Mobile - If local storage as value
		if (utilsService.isAcessedFromMobileDevice(device)) {

			if (null != encryptedMsisdn && !encryptedMsisdn.isEmpty()) {

				String decryptedMsisdn = getDecryptedMsisdn(session, encryptedMsisdn);

				if (null != decryptedMsisdn && !decryptedMsisdn.isEmpty()) {

					session.setAttribute(TEMPORARY_MSISDN, decryptedMsisdn);
					session.setAttribute(STORE_ID, null);
					boolean error = false;
					String storeId = null;
					try {
						storeId = utilsService.getStoreIdWithStoreIdentification(null, request, session, device);
					} catch (StoreServerException sse) {
						logger.error("Unable to get storeId," + sse);
						if (null != sse.getCode() && null != sse.getSubCode()
								&& sse.getCode().equals("resource_forbidden")
								&& sse.getSubCode().equals("blocked_user")) {
							responseWrapper.setDescription(sse.getDescription());
							error = true;
						}
					}
					session.setAttribute(TEMPORARY_MSISDN, null);

					if (fromLocalStorage) {
						session.setAttribute(RELOGIN, true);
					}

					boolean isHeaderUser = false;
					try {
						isHeaderUser = isHeaderUser(request, session, device, decryptedMsisdn, tokenKey, storeId,
								encryptedUUID);
						session.setAttribute(HEADERMSISDN, isHeaderUser);
					} catch (StoreServerException storeException) {
						logger.error("Something went wrong while checking header user: " + storeException.getMessage(),
								storeException);

						if (AUTHENTICATION_ERROR.equalsIgnoreCase(storeException.getCode())) {
							responseWrapper.setResult(AUTHENTICATION_ERROR);
							session.invalidate();
						} else {
							responseWrapper.setResult("token_generation_failed");
						}

						return responseWrapper;
					}

					if (!error) {
						session = utilsService.regenerateSession(request, session);
						session.setAttribute(MSISDN, decryptedMsisdn);
						responseWrapper = utilsService.updateUUIDInResponse(session, responseWrapper);
						result = "success";
					} else {
						result = "error";
					}
				}
			}
		}
		responseWrapper.setResult(result);
		return responseWrapper;
	}

	private boolean isHeaderUser(HttpServletRequest request, HttpSession session, Device device, String msisdn,
			String tokenKey, String storeId, String encryptedUUID) throws StoreServerException {
		logger.info("Inside isHeaderUser()...");
		boolean isHeaderUser = false;
		try {
			String token = null;
			if (null == storeId) {
				storeId = utilsService.getStoreId(request, session, device);
			}

			token = utilsService.getAuthenticationToken(session, msisdn, storeId, encryptedUUID, null, null, null,
					null);

			if (null != token) {
				isHeaderUser = true;
			}
		} catch (StoreServerException e) {
			logger.error("Error while getting token: " + e.getMessage(), e);
			isHeaderUser = false;
			throw e;
		}
		logger.info("isHeaderUser: " + isHeaderUser);
		return isHeaderUser;
	}

	private String getDecryptedMsisdn(HttpSession session, String encryptedMsisdn) {
		String decryptedMsisdn = null;
		if (null != encryptedMsisdn && !encryptedMsisdn.isEmpty()) {
			try {
				logger.debug("encryptedMsisdn msisdn: " + encryptedMsisdn);
				encryptedMsisdn = URLDecoder.decode(encryptedMsisdn, "UTF-8");
				logger.debug("encryptedMsisdn msisdn after decode: " + encryptedMsisdn);

				decryptedMsisdn = PasswordEncryptor.decrypt(encryptedMsisdn);
				logger.debug("decrypted msisdn: " + decryptedMsisdn);
			} catch (Exception e) {
				logger.error("decryption failed while updating msisdn, msisdn is:" + encryptedMsisdn + e.getMessage());
			}
		}
		return decryptedMsisdn;
	}

	public String getDecryptedMsisdnForOoredo(HttpServletRequest request, Device device, String encryptedMdn,
			String correlatorId) {
		logger.info("Encrypted msisdn recieved: " + encryptedMdn);
		try {
			if (utilsService.isAcessedFromMobileDevice(device)) {

				encryptedMdn = URLDecoder.decode(encryptedMdn, "UTF-8");
				logger.info(
						"Encrypted msisdn recieved After decode: " + encryptedMdn + ", correlatorId: " + correlatorId);
				ResponseWrapper responseWrapper = new ResponseWrapper();

				HttpSession session = request.getSession();
				String decryptionKey = applicationResource.getParameter(session, "pwa.ooredo.decryption.key");
				String iv = applicationResource.getParameter(session, "pwa.ooredo.initialization.vector");

				String decryptedMsisdn = OoredoAESUtils.decrypt(encryptedMdn, hexStringToByteArray(decryptionKey),
						hexStringToByteArray(iv));

				logger.info("decryptedMsisdn: " + decryptedMsisdn);

				if (null != decryptedMsisdn) {
					session = utilsService.regenerateSession(request, session);
					session.setAttribute(MSISDN, decryptedMsisdn);
					session.setAttribute(HEADERMSISDN, true);

					String dateFormat = applicationResource.getParameter(session, "pwa.ooredo.report.log.dateformat");
					OoredoOmanLogger.writeCDRLog(request, decryptedMsisdn, encryptedMdn, correlatorId, dateFormat);
					String encryptedMsisdn = utilsService.getEncryptedMsisdn(decryptedMsisdn, device);

					responseWrapper.setEncryptedMsisdn(encryptedMsisdn);
					responseWrapper = utilsService.updateUUIDInResponse(session, responseWrapper);
					return webUtils.obtainJSONFromObject(responseWrapper);
				}
			}
		} catch (Exception e) {
			logger.error("decryption failed, msisdn is :" + encryptedMdn + e.getMessage());
		}
		return null;
	}

	private static byte[] hexStringToByteArray(String s) {
		int len = s.length();
		byte[] data = new byte[len / 2];
		for (int i = 0; i < len; i += 2) {
			data[i / 2] = (byte) ((Character.digit(s.charAt(i), 16) << 4) + Character.digit(s.charAt(i + 1), 16));
		}
		return data;
	}

	public String getEncryptedDataForContest(HttpServletRequest request, HttpSession session)
			throws JsonProcessingException {

		String msisdn = (String) session.getAttribute(MSISDN);
		logger.info("Inside getencryptedcontestdata msisdn: " + msisdn);

		if (null != msisdn) {
			String key = applicationResource.getParameter(session, "pwa.contest.decryption.key");
			String initVector = applicationResource.getParameter(session, "pwa.contest.initialization.vector");
			String utm_source = applicationResource.getParameter(session, "pwa.contest.utm.source");
			String platform = applicationResource.getParameter(session, "pwa.contest.platform");
			ContestDataBean bean = new ContestDataBean();
			bean.setMsisdn(msisdn);
			bean.setPlatform(platform);
			bean.setUtm_source(utm_source);

			ObjectMapper mapper = new ObjectMapper();
			String stringValue = mapper.writeValueAsString(bean);
			String encryptedValue = ContestUtils.encrypt(stringValue, key, initVector);
			logger.info("encryptedValue" + encryptedValue);

			ResponseWrapper responseWrapper = new ResponseWrapper();
			responseWrapper.setResult(encryptedValue);
			return webUtils.obtainJSONFromObject(responseWrapper);
		}
		return null;
	}

	public String getDecryptedDataForContest(String encryptedData, String localStorageData, String storeId,
			String encryptedUUID, HttpServletRequest request, HttpSession session) throws StoreServerException {

		try {
			logger.info("Inside getdecryptedcontestdata: " + encryptedData);
			if (encryptedData != null) {
				logger.debug("encryptedMsisdn data: " + encryptedData);
				encryptedData = URLDecoder.decode(encryptedData, "UTF-8");
				logger.debug("encryptedMsisdn data after decode: " + encryptedData);

				String key = applicationResource.getParameter(session, "pwa.contest.decryption.key");
				String initVector = applicationResource.getParameter(session, "pwa.contest.initialization.vector");
				String msisdn = ContestUtils.decrypt(encryptedData, key, initVector);

				if (null != msisdn) {
					boolean sendResult = false;
					if (null != localStorageData) {
						String localMsisdn = getDecryptedMsisdn(session, localStorageData);
						if (null != localMsisdn && localMsisdn.equals(msisdn)) {
							sendResult = true;
						}
					} else {
						sendResult = true;
					}

					if (sendResult) {
						ResponseWrapper responseWrapper = new ResponseWrapper();

						if (null != encryptedUUID && utilsService.isUUIDFeatureEnabled(session)) {
							String ctoken = utilsService.getdecryptedUUID(encryptedUUID);
							session.setAttribute(CTOKEN, ctoken);
						}

						responseWrapper.setResult("success");
						if (null != storeId) {
							logger.info("StoreId from Contest Url: " + storeId);
							session.setAttribute(STORE_ID, storeId);
						}
						session = utilsService.regenerateSession(request, session);
						session.setAttribute(MSISDN, msisdn);
						return webUtils.obtainJSONFromObject(responseWrapper);
					} else {
						StoreServerException se = new StoreServerException();
						String desc = applicationResource.getParameter(session,
								"pwa.invalid.contest.user.error.description");
						se.setDescription(desc);
						se.setCode("contestInvalidUser");
						throw se;
					}
				}
			}
		} catch (Exception e) {
			logger.error("Unable to decryptMsisdn for contestdata: " + encryptedData);
		}
		return null;
	}

	public String postPwaLaunch(String language, String user_id, String subscription_status, String subscription_type,
			String operator, String circle, HttpServletRequest request, HttpSession session, Device device)
			throws StoreServerException {

		logger.info("Inside postPwaLaunch(): ");
		try {
			String storeId = utilsService.getStoreId(request, session, device);
			String msisdn = utilsService.getMsisdn(request, device);
			String encMsisdn = utilsService.getAESEncryptedMSISDN(msisdn);

			PwaLaunchBean pwaLaunchBean = new PwaLaunchBean();
			EventDataBean event_data = new EventDataBean();

			if (null != user_id) {
				pwaLaunchBean.setUserId(user_id);
			}
			pwaLaunchBean.setSource("pwa");
			pwaLaunchBean.setType("event");
			pwaLaunchBean.setEventName("applaunch");

			if (null != msisdn) {
				pwaLaunchBean.setMsisdn(encMsisdn);
				event_data.setOperator(operator);
				event_data.setCircle(circle);
				event_data.setSubscriptionType(subscription_type);
				event_data.setSubscriptionStatus(subscription_status);
			}
			event_data.setStoreId(storeId);
			event_data.setLanguage(language);
			String cleverTapId = applicationResource.getParameter(session, "pwa.clevertap.account.id");
			event_data.setProviderId(cleverTapId);
			event_data.setProviderType("clevertap");
			pwaLaunchBean.setEventData(event_data);

			String pwaLaunchBeanStr = webUtils.obtainJSONStringFromObject(pwaLaunchBean);
			logger.info("PWA launch request: " + pwaLaunchBeanStr);

			String url = applicationResource.getParameter(session, "pwa.app.launch.event.notifications.url");
			url = webUtils.getUpdatedVoltronUrl(session, url);
			logger.info("Going to hit PWA Launch url: " + url);
			String postResponse = voltronInterface.hitVoltronAPI(session, url, REQUEST_POST, pwaLaunchBeanStr,
					String.class);
			logger.info("Post response from voltron: " + postResponse);
			return postResponse;

		} catch (StoreServerException e) {
			logger.error("Exception while launching PWA: " + e);
			throw e;
		}
	}

	public String getOperatorUserDetails(String token, String ctoken, String mode, HttpServletRequest request,
			HttpSession session, Device device) throws StoreServerException {

		logger.info("Inside getOperatorUserDetails(): ");
		String res = null;
		try {
			String url = applicationResource.getParameter(session, "pwa.getuserInfo.url");
			String storeId = utilsService.getStoreId(request, session, device);
			url = url.replaceAll("%STORE_ID%", storeId);
			url = url.replace("%CRED_TOKEN%", token);
			url += "&ctoken=" + ctoken;
			url += "&mode=" + mode;
			url = webUtils.getUpdatedVoltronUrl(session, url);

			logger.info("Hitting voltron url: " + url + " to get User Info");
			String userInfo = voltronInterface.hitVoltronAPI(session, url, REQUEST_GET, null, String.class);
			if (null != userInfo) {
				String msisdn = utilsService.getMsisdnFromUserInfo(userInfo);
				if (null != msisdn) {
					res = utilsService.getEncryptedMsisdn(msisdn, null);
					session.setAttribute(MSISDN, msisdn);
					session.setAttribute(TEMPORARY_MSISDN, null);
					session.setAttribute(AUTH_TOKEN, token);
					if (utilsService.isAcessedFromMobileDevice(device)) {
						session.setAttribute(HEADERMSISDN, true);
					}
					session.setAttribute(REGISTERED, true);
				}
			}
			return res;
		} catch (StoreServerException e) {
			logger.error("Exception while getting AppUserDetail: " + e);
			throw e;
		}
	}

}
