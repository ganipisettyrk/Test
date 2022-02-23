package com.onmobile.rbt.pwa.services;

import java.lang.reflect.Field;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Enumeration;
import java.util.List;
import java.util.Properties;
import java.util.UUID;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mobile.device.Device;
import org.springframework.stereotype.Service;

import com.google.gson.Gson;
import com.onmobile.encryptor.PasswordEncryptor;
import com.onmobile.rbt.pwa.beans.MsisdnBean;
import com.onmobile.rbt.pwa.beans.StoreDetailsBean;
import com.onmobile.rbt.pwa.utils.ApplicationResourceInterface;
import com.onmobile.rbt.pwa.utils.ResponseWrapper;
import com.onmobile.rbt.pwa.utils.StoreServerException;
import com.onmobile.rbt.pwa.utils.VoltronInterface;
import com.onmobile.rbt.pwa.utils.WebConstants;
import com.onmobile.rbt.pwa.utils.WebUtilsInterface;
import com.onmobile.rbt.pwa.utils.AESUtilities.AES;
import com.onmobile.rbt.pwa.utils.AESUtilities.AESContext;
import com.onmobile.rbt.pwa.utils.TokenUtilities.asymmetric.RSA;
import com.onmobile.rbt.pwa.utils.TokenUtilities.bean.CryptoExchangeDto;
import com.onmobile.rbt.pwa.utils.TokenUtilities.bean.CryptoPayloadDto;
import com.onmobile.rbt.pwa.utils.TokenUtilities.hmac.HMAC;
import com.onmobile.rbt.pwa.utils.TokenUtilities.hmac.HMACContext;
import com.onmobile.rbt.pwa.utils.TokenUtilities.utilities.CryptoExchangeUtility;
import com.onmobile.store.storefront.dto.GsonFactory;
import com.onmobile.store.storefront.dto.authentication.AuthenticationToken;
import com.onmobile.store.storefront.dto.user.Subscription;
import com.onmobile.store.storefront.dto.user.User;

@Service
public class UtilityService implements WebConstants {
	private static final Logger logger = LogManager.getLogger(UtilityService.class);

	@Autowired
	ApplicationResourceInterface applicationResource;

	@Autowired
	WebUtilsInterface webUtils;

	@Autowired
	VoltronInterface voltronInterface;

	public String getMsisdn(HttpServletRequest request, Device device) {
		HttpSession session = request.getSession();
		String msisdn = null;

		if (null != session.getAttribute(MSISDN)) {
			msisdn = (String) session.getAttribute(MSISDN);
			logger.info("MSISDN no. from session: " + msisdn);
		}
		logger.info("MSISDN is " + msisdn);

		return msisdn;
	}

	public String getTefSpainSpecificEncryyptedMsisdn(HttpServletRequest request, Device device) {
		HttpSession session = request.getSession();

		String tefSpainHEEnabled = applicationResource.getParameter(session, "pwa.enable.tefspain.header.check",
				"false");
		logger.info("tefSpainHEEnabled: " + tefSpainHEEnabled);

		if (Boolean.parseBoolean(tefSpainHEEnabled) && device.isMobile()) {
			String headerName = applicationResource.getParameter(session, "pwa.auth.token.voltron.api.header.name");
			String headerValue = null;
			String portNum = null;
			if(null != headerName) {
				headerValue = request.getHeader(headerName);
			}
					
			String portHeaderName = applicationResource.getParameter(session,
					"pwa.auth.token.voltron.api.port.header.name");
			if(null != portHeaderName) {
				portNum = request.getHeader(portHeaderName);
			}
			logger.info("header name: " + headerName + ", header value: " + headerValue + ", portHeaderName: "
					+ portHeaderName + ", port: " + portNum);
			if (null != headerValue && !headerValue.isEmpty()) {
				String token = null;
				String userInfo = null;
				String storeId = getStoreId(request, session, device);
				try {
					token = getAuthenticationToken(session, null, storeId, null, headerName, headerValue,
							portHeaderName, portNum);
					userInfo = getUserInfoResponse(session, storeId, token);
				} catch (StoreServerException e) {
					if (AUTH_TOKEN_EXPIRED.equalsIgnoreCase(e.getCode())) {
						try {
							logger.error(
									"Token expired while getting userInfo, so generating token and hitting the url...");
							token = getNewAuthenticationToken(session, null, storeId, null, headerName, headerValue,
									portHeaderName, portNum);
							userInfo = getUserInfoResponse(session, storeId, token);
						} catch (StoreServerException e1) {
							logger.error("Exception while getting userInfo: for Tef Spain specific user ", e1);
						}
					} else {
						logger.error("Exception while getting userInfo: for Tef Spain specific user", e);
					}
				}
				if (null != userInfo) {
					String userMsisdn = getMsisdnFromUserInfo(userInfo);
					if (null != userMsisdn) {
						session = regenerateSession(request, session);
						session.setAttribute(MSISDN, userMsisdn);
						session.setAttribute(HEADERMSISDN, true);
						String encryptedMsisdn = getEncryptedMsisdn(userMsisdn, device);
						return encryptedMsisdn;
					}
				}
			}
		}
		return null;

	}

	public String getMsisdnFromUserInfo(String userInfo) {
		logger.info("Inside UtitlityService, getMsisdnFromUserInfo()...");
		String msisdn = null;
		User user = (User) webUtils.fromJson(userInfo, User.class);
		msisdn = user.getMSISDN();
		logger.info("msisdn from getMsisdnFromUserInfo: " + msisdn);
		return msisdn;
	}

	public boolean isAcessedFromMobileDevice(Device device) {

		boolean isMobile = false;
		if (device.isMobile()) {
			isMobile = true;
		}
		return isMobile;

	}

	public String getStoreIdFromSession(HttpSession session) {
		String storeId = (String) session.getAttribute(STORE_ID);
		return storeId;
	}

	public String getStoreId(HttpServletRequest request, HttpSession session, Device device) {
		String storeId = getStoreIdFromSession(session);

		if (storeId != null && !storeId.isEmpty()) {
			logger.info("StoreId from session: " + storeId);
			return storeId;
		} else {

			try {
				storeId = getStoreIdWithStoreIdentification(null, request, session, device);
			} catch (StoreServerException sse) {
				logger.error("Unable to get storeId," + sse);
			}

			if (null == storeId || storeId.isEmpty()) {
				storeId = applicationResource.getParameter(session, "pwa.default.store.id");
				session.setAttribute(STORE_ID, storeId);
				logger.info("StoreId from Default Config: " + storeId);

			} else {
				logger.info("StoreId from StoreIdentification: " + storeId);
				session.setAttribute(STORE_ID, storeId);
			}
			return storeId;
		}
	}

	public String getStoreIdWithStoreIdentification(String type, HttpServletRequest request, HttpSession session,
			Device device) throws StoreServerException {

		String storeId = null;
		String storeIdentificationRequired = applicationResource.getParameter(session,
				"pwa.store.identification.required");

		if (Boolean.parseBoolean(storeIdentificationRequired)) {
			logger.info("Hitting StoreIdentification for storeId");

			String msisdn = null;
			if (null != type && type.equals("changenumber")) {
				msisdn = (String) session.getAttribute(TEMPORARY_MSISDN);
				logger.info("User opted to change number: " + msisdn);
			} else {
				msisdn = getMsisdn(request, device);
			}
			if (msisdn == null) {
				msisdn = (String) session.getAttribute(TEMPORARY_MSISDN);
				logger.info("TEMPORARY_MSISDN" + msisdn);
			}
			if (msisdn != null) {
				String url = applicationResource.getParameter(session, "pwa.store.identification.url");
				url = webUtils.getUpdatedVoltronUrl(session, url);
				MsisdnBean msisdnBean = new MsisdnBean(msisdn);

				if (null != url) {
					String source = applicationResource.getParameter(session, "pwa.mode", "PWA");
					String sqn = applicationResource.getParameter(session, "pwa.sqn.value");
					if (null != sqn) {
						url = url.replace("%SQN%", sqn);
					}
					if (null != source) {
						url = url.replaceAll("%SOURCE%", source);
					}
				}
				try {
					logger.info("storeId identification url: " + url);

					String response = voltronInterface.hitVoltronAPI(session, url, REQUEST_POST, msisdnBean,
							String.class);
					logger.info("storeId identification response: " + response);
					StoreDetailsBean storeDetailsBean = (StoreDetailsBean) webUtils.fromJson(response,
							StoreDetailsBean.class);
					storeId = storeDetailsBean.getStore_id();
				} catch (StoreServerException sse) {
					logger.error("Unable to get storeId for: " + msisdn + "," + sse);
					throw sse;
				}
			}
		}
		return storeId;
	}

	public String getUserId(HttpServletRequest request, HttpSession session, Device device)
			throws StoreServerException {
		logger.info("Inside UtitlityService, getUserId()...");
		String userId = null;
		try {
			String userInfo = getUserInfo(request, session, device);
			User user = (User) webUtils.fromJson(userInfo, User.class);
			userId = user.getID();
			logger.info("userId: " + userId);
		} catch (StoreServerException e) {
			logger.error("Error while creating the user id: " + e);
			return webUtils.obtainJSONFromObject(e);
		}
		return userId;
	}

	public String getUserInfo(HttpServletRequest request, HttpSession session, Device device)
			throws StoreServerException {
		logger.info("Inside UtilityService::getUserInfo()");
		String msisdn = getMsisdn(request, device);
		String storeId = getStoreId(request, session, device);

		String token = null;
		String userInfo = null;
		try {
			token = getAuthenticationToken(session, msisdn, storeId);
			userInfo = getUserInfoResponse(session, storeId, token);
		} catch (StoreServerException storeException) {

			if (AUTH_TOKEN_EXPIRED.equalsIgnoreCase(storeException.getCode())) {
				logger.info("Token expired while getting userInfo, so generating token and hitting the url...");
				token = getNewAuthenticationToken(session, msisdn, storeId);
				userInfo = getUserInfoResponse(session, storeId, token);
			} else {
				logger.error("Exception while getting userInfo: " + msisdn, storeException);
				throw storeException;
			}
		}
		return userInfo;
	}

	private String getUserInfoResponse(HttpSession session, String storeId, String token) throws StoreServerException {
		String url = applicationResource.getParameter(session, "pwa.getuserInfo.url");
		url = url.replaceAll("%STORE_ID%", storeId);
		url = url.replace("%CRED_TOKEN%", token);
		url = webUtils.getUpdatedVoltronUrl(session, url);

		logger.info("Hitting voltron url: " + url + " to return User Info");

		String userInfo = voltronInterface.hitVoltronAPI(session, url, REQUEST_GET, null, String.class);
		return userInfo;
	}

	public String getNewAuthenticationToken(HttpSession session, String msisdn, String storeId)
			throws StoreServerException {
		return getNewAuthenticationToken(session, msisdn, storeId, null, null, null, null, null);
	}

	public String getNewAuthenticationToken(HttpSession session, String msisdn, String storeId, String encryptedUUID,
			String headerKey, String headerValue, String portKey, String portNum) throws StoreServerException {

		session.setAttribute(AUTH_TOKEN, null);
		String url = applicationResource.getParameter(session, "pwa.user.authentication.token.url");
		String sqn = applicationResource.getParameter(session, "pwa.sqn.value");
		url = url.replace("%STORE_ID%", storeId);

		CryptoPayloadDto cryptoPayload = generateRequestBody(msisdn, null, session, "generateToken", encryptedUUID);

		if (null != sqn) {
			url = url.replace("%SQN%", sqn);
		}

		String eventType = null;
		if (null != session.getAttribute(RELOGIN) && null != session.getAttribute(REGISTERED)) {
			// local storage user once after sending relogin, further we should pass renewal
			eventType = "token_renewal";
		} else if (null != session.getAttribute(RELOGIN)) {
			// local storage user comes first time, we pass relogin
			eventType = "relogin";
		} else if (null == session.getAttribute(REGISTERED)) {
			eventType = "register";
		} else {
			eventType = "token_renewal";
		}
		if (null != eventType) {
			url += "&event_type=" + eventType;
		}
		url = webUtils.getUpdatedVoltronUrl(session, url);
		logger.info("Going to hit auth token url: " + url);

		String token = null;
		try {
			AuthenticationToken authToken = voltronInterface.hitVoltronAPI(session, url, REQUEST_POST, cryptoPayload,
					AuthenticationToken.class, headerKey, headerValue, portKey, portNum, true);
			token = authToken.getToken();
			session.setAttribute(REGISTERED, true);
			if (null != token) {
				boolean validateHmac = validateHmacResponse(token, authToken.getHmac(), session);
				if (validateHmac) {
					logger.info("Auth Token generated for MSISDN: " + msisdn + " is: " + authToken.getToken());
					session.setAttribute(AUTH_TOKEN, token);
				} else {
					logger.info("Token validation failed");
					token = null;
				}

			}
		} catch (StoreServerException storeServerException) {
			logger.error("Exception while generating token for: " + msisdn, storeServerException);
			throw storeServerException;
		}
		return token;
	}

	public String getAuthenticationToken(HttpSession session, String msisdn, String storeId)
			throws StoreServerException {
		return getAuthenticationToken(session, msisdn, storeId, null, null, null, null, null);
	}

	public String getAuthenticationToken(HttpSession session, String msisdn, String storeId, String encryptedUUID,
			String headerKey, String headerValue, String portKey, String portNum) throws StoreServerException {

		String token = (String) session.getAttribute(AUTH_TOKEN);
		if (null == token || token.isEmpty()) {
			try {
				token = getNewAuthenticationToken(session, msisdn, storeId, encryptedUUID, headerKey, headerValue,
						portKey, portNum);
			} catch (StoreServerException sse) {
				throw sse;
			}
		}
		return token;
	}

	public String getUserStatus(HttpServletRequest request, HttpSession session, Device device, boolean isRTContent)
			throws StoreServerException {
		logger.info("Inside UtilityService:: getUserStatus()");

		Subscription[] subsciptionArray = getUserSubscriptionArray(request, session, device, isRTContent);
		if (subsciptionArray[0].getStatus() != null) {
			if (subsciptionArray[0].getStatus().equalsIgnoreCase("canceled")
					|| subsciptionArray[0].getStatus().equalsIgnoreCase("NEW_USER")) {
				// Unsubscribed user
				return NEW_USER;
			} else {
				return EXISTING_USER;
			}
		} else {
			throw new StoreServerException();
		}
	}

	public String getVoltronUserStatus(HttpServletRequest request, HttpSession session, Device device,
			boolean isRTContent) throws StoreServerException {
		logger.info("Inside UtilityService:: getVoltronUserStatus()");

		Subscription[] subsciptionArray = getUserSubscriptionArray(request, session, device, isRTContent);
		if (subsciptionArray[0].getStatus() != null) {
			String status = subsciptionArray[0].getStatus();
			logger.info("user_status from getVoltronUserStatus(): " + status);
			return status;
		} else {
			throw new StoreServerException();
		}
	}

	public String getUserSubscriptionDetails(HttpServletRequest request, HttpSession session, Device device,
			boolean isRTContent) throws StoreServerException {
		logger.info("Inside UtilityService:: getUserSubscriptionDetails()");
		// For BSNL operator
		String msisdn = getMsisdn(request, device);
		String storeId = getStoreId(request, session, device);

		return getUserSubscriptions(request, session, msisdn, storeId, isRTContent);

	}

	public Subscription[] getUserSubscriptionArray(HttpServletRequest request, HttpSession session, Device device,
			boolean isRTContent) throws StoreServerException {
		logger.info("Inside UtilityService:: getUserSubscriptionArray()");

		String msisdn = getMsisdn(request, device);
		String storeId = getStoreId(request, session, device);

		String response = getUserSubscriptions(request, session, msisdn, storeId, isRTContent);
		Gson gson = GsonFactory.getGson();
		Subscription[] subsciptionArray = gson.fromJson(response, Subscription[].class);

		return subsciptionArray;
	}

	private String getUserSubscriptions(HttpServletRequest request, HttpSession session, String msisdn, String storeId,
			boolean isRTContent) throws StoreServerException {
		logger.info("Inside SubscriptionService::getUserSubscriptions");

		String token = null;
		String userSubscriptions = null;

		try {
			token = getAuthenticationToken(session, msisdn, storeId);
			userSubscriptions = getUserStoreSubscriptions(session, storeId, msisdn, token, isRTContent);
		} catch (StoreServerException storeException) {

			if (AUTH_TOKEN_EXPIRED.equalsIgnoreCase(storeException.getCode())) {
				logger.info("Token expired while getting usersubscriptions,"
						+ " so generating token and hitting the url...");
				token = getNewAuthenticationToken(session, msisdn, storeId);
				userSubscriptions = getUserStoreSubscriptions(session, storeId, msisdn, token, isRTContent);
			} else {
				logger.error("Unable to get User info for MSISDN: " + msisdn);
				throw storeException;
			}
		}
		return userSubscriptions;
	}

	private String getUserStoreSubscriptions(HttpSession session, String storeId, String msisdn, String token,
			boolean isRTContent) throws StoreServerException {
		String url = applicationResource.getParameter(session, "pwa.user.store.subscriptions.url");
		url = url.replace("%CRED_TOKEN%", token);
		url = url.replace("%STORE_ID%", storeId);
		url = webUtils.getUpdatedVoltronUrl(session, url);

		if (isRTContent) {
			if (!url.contains("?")) {
				url += "?";
			}
			url += "&type=realtone";
		}

		logger.info("Hitting voltron url: " + url + " to return User Status for msisdn: " + msisdn);

		String storeSubscriptions = voltronInterface.hitVoltronAPI(session, url, REQUEST_GET, null, String.class);
		return storeSubscriptions;
	}

	public String getOS(HttpServletRequest request) {
		String os = null;
		String userAgent = (String) request.getHeader("User-Agent");

		if (userAgent != null && !userAgent.isEmpty()) {
			if (userAgent.toLowerCase().contains("android")) {
				os = ANDROID;
			} else if (userAgent.toLowerCase().contains("iphone") || userAgent.toLowerCase().contains("ipad")) {
				os = IOS;
			}
		}
		return os;
	}

	public HttpSession regenerateSession(HttpServletRequest request, HttpSession session) {

		String oldSessionId = session.getId();
		Enumeration<String> attrNames = session.getAttributeNames();
		Properties props = new Properties();
		Field[] fields = WebConstants.class.getFields();// getting all fields from WebConstants.

		while (null != attrNames && attrNames.hasMoreElements()) {
			String key = (String) attrNames.nextElement();
			for (Field f1 : fields) {
				try {
					// We'll copy only those attributes what we set in the session.
					if (f1.get(f1.getName()).equals(key)) {
						props.put(key, session.getAttribute(key));
						break;
					}
				} catch (IllegalAccessException e) {
					logger.error("IllegalAccessException: " + e);
				}
			}
			
		}
		logger.info("Existing sessionId: " + oldSessionId + ", attributes before invalidating: "
				+ props.keySet().toString());
		session.invalidate();
		logger.info("Existing session with id: " + oldSessionId + " is invalidated...");

		session = request.getSession(true);
		String newSessionId = session.getId();
		logger.info("New session with id: " + newSessionId + " is created...");
		Enumeration<Object> attrNames1 = props.keys();
		while (null != attrNames1 && attrNames1.hasMoreElements()) {
			String key = (String) attrNames1.nextElement();
			session.setAttribute(key, props.get(key));
		}
		logger.info("attributes in new session: " + props.keySet().toString());
		return session;
	}

	public String getEncryptedMsisdn(String msisdn, Device device) {

		String encryptedMsisdn = null;

		if (null == device || isAcessedFromMobileDevice(device)) {
			if (null != msisdn && !msisdn.isEmpty()) {
				encryptedMsisdn = getEncryptedMsisdnWithPasswordEncryptor(msisdn);
			}
		}
		return encryptedMsisdn;
	}

	private String getEncryptedMsisdnWithPasswordEncryptor(String msisdn) {
		String encryptedMdn = null;
		if (null != msisdn && !msisdn.isEmpty()) {
			try {
				encryptedMdn = PasswordEncryptor.encrypt(msisdn);
				logger.debug("Encrypted msisdn - " + encryptedMdn);
			} catch (Exception e) {
				logger.error("Encryption failed while updating msisdn, msisdn is :" + msisdn + e.getMessage());
			}
		}
		return encryptedMdn;
	}

	public String getAESEncryptedMSISDN(String msisdn) {
		String encryptedMdn = null;
		if (null != msisdn && !msisdn.isEmpty()) {
			encryptedMdn = AES.encryptWithDefaultKey(msisdn);
			logger.debug("Encrypted msisdn - AES - " + encryptedMdn);
		}
		return encryptedMdn;

	}

	public CryptoPayloadDto generateRequestBody(String msisdn, String pin, HttpSession session, String type,
			String encryptedUUID) {
		logger.info("Inside UtilityService:: generateRequestBody()");

		AESContext aesContext = AES.generateAESContext();
		HMACContext hmacContext = HMAC.generateHMAContext();

		String isUUIDFeatureEnabled = applicationResource.getParameter(session, "pwa.enable.uuid.passing.to.voltron",
				"false");
		String ctoken = null;

		if (Boolean.parseBoolean(isUUIDFeatureEnabled)) {
			if (null != encryptedUUID && !"null".equals(encryptedUUID) && !encryptedUUID.isEmpty()) {
				ctoken = getdecryptedUUID(encryptedUUID);
			} else {
				ctoken = getUUID(session);
			}
		} else {
			ctoken = getUUID(session);
		}

		String hmacKey;
		if (session.getAttribute(HMAC_KEY) != null) {
			hmacKey = (String) session.getAttribute(HMAC_KEY);
		} else {
			hmacKey = hmacContext.getBase64EncodedHmacKey();
			session.setAttribute(HMAC_KEY, hmacKey);
		}

		long seconds = System.currentTimeMillis() / 1000l;
		byte[] payload = CryptoExchangeUtility.prepareKeyExchangeBytes((int) seconds, 32, aesContext.getAesKey(), 32,
				Base64.getDecoder().decode(hmacKey));
		String RSA_PUBLIC_KEY = applicationResource.getParameter(session, "pwa.auth.token.rsa.public.key");
		String CRYPTO_EXCHANGE_VERSION = applicationResource.getParameter(session, "pwa.auth.token.exchange.version");

		String rsaEncryptedPayload = RSA.encrypt(payload, RSA_PUBLIC_KEY);
		String encryptedMsisdn = null;
		if (msisdn != null) {
			encryptedMsisdn = RSA.encrypt(msisdn, RSA_PUBLIC_KEY);
		}
		String encryptedPin = null;
		if (pin != null && type.equals("validateOTP")) {
			encryptedPin = RSA.encrypt(pin, RSA_PUBLIC_KEY);
		}

		List<String> data = new ArrayList<>();
		data.add(CRYPTO_EXCHANGE_VERSION);
		if (msisdn != null) {
			data.add(encryptedMsisdn);
		}
		if (!type.equals("validateOTP")) {
			data.add(rsaEncryptedPayload);
			data.add(aesContext.getBase64EncodedIV());
		} else {
			data.add(encryptedPin);
		}
		if (!type.equals("generateOTP")) {
			data.add(ctoken);
		}

		String hmac = HMAC.prepareHMAC(hmacKey, data);

		CryptoPayloadDto cryptoPayload = new CryptoPayloadDto();
		CryptoExchangeDto exchangeDto = new CryptoExchangeDto();
		exchangeDto.setVersion(CRYPTO_EXCHANGE_VERSION);
		if (!type.equals("validateOTP")) {
			exchangeDto.setPayload(rsaEncryptedPayload);
			exchangeDto.setIv(aesContext.getBase64EncodedIV());
		}
		exchangeDto.setHmac(hmac);
		if (!type.equals("generateOTP")) {
			exchangeDto.setCtoken(ctoken);

			if (Boolean.parseBoolean(isUUIDFeatureEnabled)) {
				cryptoPayload.setUuid(ctoken);
			}
		}

		cryptoPayload.setCrypto_exchange(exchangeDto);
		cryptoPayload.setMsisdn(encryptedMsisdn);
		if (type.equals("validateOTP")) {
			cryptoPayload.setEncryptedPin(encryptedPin);
		}

		return cryptoPayload;
	}

	private String getUUID(HttpSession session) {
		String ctoken;
		if (session.getAttribute(CTOKEN) != null) {
			ctoken = (String) session.getAttribute(CTOKEN);
		} else {
			ctoken = UUID.randomUUID().toString();
			session.setAttribute(CTOKEN, ctoken);
		}
		return ctoken;
	}

	public boolean validateHmacResponse(String token, String hmac, HttpSession session) {
		List<String> data = new ArrayList<>();
		data.add(token);
		String hmacKey = (String) session.getAttribute(HMAC_KEY);
		String hmacGenerated = HMAC.prepareHMAC(hmacKey, data);
		if (hmacGenerated.equals(hmac)) {
			return true;
		}
		return false;
	}

	public String getEncryptedUUID(HttpSession session) {
		String uuid = getUUID(session);
		String encUuid = null;
		try {
			encUuid = PasswordEncryptor.encrypt(uuid);
			logger.info("Encrypted UUID: " + encUuid);
		} catch (Exception ex) {
			logger.error("Something went wrong while encrypting UUID: " + ex);
		}
		return encUuid;
	}

	public String getdecryptedUUID(String encUuid) {
		String decryptedUuid = null;
		if (null != encUuid && !"null".equals(encUuid) && !encUuid.isEmpty()) {
			try {
				logger.debug("encrypted uuid: " + encUuid);
				encUuid = URLDecoder.decode(encUuid, "UTF-8");
				logger.debug("encrypted uuid after decode: " + encUuid);

				decryptedUuid = PasswordEncryptor.decrypt(encUuid);
				logger.info("decrypted UUID: " + decryptedUuid);
			} catch (Exception ex) {
				logger.error("Something went wrong while decrypting UUID: " + ex);
			}
		}
		return decryptedUuid;
	}

	public ResponseWrapper updateUUIDInResponse(HttpSession session, ResponseWrapper responseWrapper) {
	
		if (isUUIDFeatureEnabled(session)) {
			String encUUID = getEncryptedUUID(session);
			responseWrapper.setEncryptedUUID(encUUID);
		}

		return responseWrapper;

	}
	
	public boolean isUUIDFeatureEnabled(HttpSession session) {
		String isUUIDFeatureEnabled = applicationResource.getParameter(session, "pwa.enable.uuid.passing.to.voltron",
				"false");

		return Boolean.parseBoolean(isUUIDFeatureEnabled);
		
	}
}
