package com.onmobile.rbt.pwa.services;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.TimeZone;

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

import com.google.gson.reflect.TypeToken;
import com.onmobile.rbt.pwa.beans.ContentLanguageBean;
import com.onmobile.rbt.pwa.beans.FeedbackBean;
import com.onmobile.rbt.pwa.beans.NotificationsRequestObject;
import com.onmobile.rbt.pwa.beans.NotificationsSubscription;
import com.onmobile.rbt.pwa.beans.NotificationsUserAttribute;
import com.onmobile.rbt.pwa.crypto.utils.CryptoProvider;
import com.onmobile.rbt.pwa.utils.ApplicationResourceInterface;
import com.onmobile.rbt.pwa.utils.ResponseWrapper;
import com.onmobile.rbt.pwa.utils.StoreServerException;
import com.onmobile.rbt.pwa.utils.VoltronInterface;
import com.onmobile.rbt.pwa.utils.WebConstants;
import com.onmobile.rbt.pwa.utils.WebUtilsInterface;
import com.onmobile.store.storefront.dto.user.Subscription;

@Service
public class FeatureService implements WebConstants {
	private static final Logger logger = LogManager.getLogger(FeatureService.class);

	@Autowired
	ChartService chartService;

	@Autowired
	UtilityService utilService;

	@Autowired
	ApplicationResourceInterface applicationResource;

	@Autowired
	WebUtilsInterface webUtils;

	@Autowired
	VoltronInterface voltronInterface;

	@Autowired(required = false)
	CryptoProvider cryptoProvider;

	public String populateBanners(HttpServletRequest request, HttpSession session, String bannerGroup,
			String contentLanguage, Device device) throws StoreServerException {

		String storeId = utilService.getStoreId(request, session, device);
		logger.info("storeId " + storeId);
		String url = applicationResource.getParameter(session, "pwa.banner.url");
		boolean isMobile = utilService.isAcessedFromMobileDevice(device);
		String bannerWidth = null;
		if(isMobile) {
			bannerWidth = applicationResource.getParameter(session, "pwa.banner.image.width.for.mobile");
		}else {
			bannerWidth = applicationResource.getParameter(session, "pwa.banner.image.width.for.desktop");
		}

		if (null != contentLanguage) {
			contentLanguage = "language:'" + contentLanguage.replace(",", "' or '") + "'";
		}
		url = url.replace("%STORE_ID%", storeId);
		url = url.replace("%BANNER_GROUP%", bannerGroup);
		url = url.replace("%CONTENT_LANGUAGE%", contentLanguage);
		if (null != bannerWidth) {
			url = url.replace("%IMAGE_WIDTH%", bannerWidth);
		}

		url = getUpdateBannerUrl(request, session, device, url);

		url = webUtils.getUpdatedVoltronUrl(session, url);

		logger.info("Retreiving banner with url : " + url);
		String banners = voltronInterface.hitVoltronAPI(session, url, REQUEST_GET, null, String.class);
		return banners;
	}

	private String getUpdateBannerUrl(HttpServletRequest request, HttpSession session,
			Device device, String bannerUrl) throws StoreServerException {

		if (bannerUrl.contains("%CLASS_OF_SERVICE%") || bannerUrl.contains("%USER_TYPE%")
				|| bannerUrl.contains("%USER_STATUS%")) {

			String msisdn = utilService.getMsisdn(request, device);
			boolean removeFilterParams = false;

			if (null != msisdn) {
				Subscription[] userSubscriptions = utilService
						.getUserSubscriptionArray(request, session, device, false);

				if (null != userSubscriptions) {
					if (bannerUrl.contains("%CLASS_OF_SERVICE%")) {
						if (userSubscriptions[0].getClassOfService() != null) {
							bannerUrl = bannerUrl.replace("%CLASS_OF_SERVICE%",
									userSubscriptions[0].getClassOfService());
						} else {
							bannerUrl = removeBannerFilterForClassOfService(bannerUrl);
						}
					}

					if (bannerUrl.contains("%USER_TYPE%")) {
						if (userSubscriptions[0].getOperatorUserType() != null) {
							bannerUrl = bannerUrl.replace("%USER_TYPE%", userSubscriptions[0].getOperatorUserType());
						} else {
							bannerUrl = removeBannerFilterForUserType(bannerUrl);
						}
					}

					if (bannerUrl.contains("%USER_STATUS%")) {
						if (userSubscriptions[0].getStatus() != null) {
							bannerUrl = bannerUrl.replace("%USER_STATUS%", userSubscriptions[0].getStatus());
						} else {
							bannerUrl = removeBannerFilterForUserStatus(bannerUrl);
						}
					}
				} else {
					removeFilterParams = true;
				}
			} else {
				removeFilterParams = true;
			}

			if (removeFilterParams) {
				bannerUrl = removeBannerFilterForClassOfService(bannerUrl);
				bannerUrl = removeBannerFilterForUserType(bannerUrl);
				bannerUrl = removeBannerFilterForUserStatus(bannerUrl);
			}

		}

		return bannerUrl;
	}

	public String getPageDataFromVoltron(String pageType, String browsingLanguage,
			HttpServletRequest request, HttpSession session, Device device)
			throws StoreServerException {

		String storeId = utilService.getStoreId(request, session, device);
		String url = applicationResource.getParameter(session, "pwa." + pageType + ".url");
		url = url.replace("%STORE_ID%", storeId);
		url = url.replace("%BROWSING_LANGUAGE%", browsingLanguage);
		
		url = webUtils.getUpdatedVoltronUrl(session, url);

		logger.info("User requested for " + pageType + " page, hitting " + url + " to get data...");

		return voltronInterface.hitVoltronAPI(session, url, REQUEST_GET, null,
				String.class);
	}

	/*public String getPageStaticData(String path) {

		ResponseWrapper responseWrapper = new ResponseWrapper();
		String dataText = null;
		StringBuilder stringBuilder = new StringBuilder();
		Path aboutServiceFilePath = Paths.get(path);
		if (Files.exists(aboutServiceFilePath)) {
			logger.info("get about-service/privacy-policy from path: " + aboutServiceFilePath.getFileName().toString());
			try (BufferedReader reader = Files.newBufferedReader(aboutServiceFilePath, StandardCharsets.UTF_8)) {
				String line = null;
				while ((line = reader.readLine()) != null) {
					stringBuilder.append(line + "\n");
				}
				dataText = stringBuilder.toString();
			} catch (IOException e) {
				logger.error("Exception while reading from file", e);
				dataText = "fileError";
			}
		} else {
			dataText = "fileNotExists";
		}
		responseWrapper.setResult(dataText);
		return webUtils.obtainJSONFromObject(responseWrapper);
	}*/

	public List<ContentLanguageBean> populateRegionalLanguages(HttpServletRequest request,
			HttpSession session) throws StoreServerException {
		logger.info("Inside FeatureService::populateRegionalLanguages");

		List<ContentLanguageBean> contentLangSet = new ArrayList<ContentLanguageBean>();

		int langItemSize = applicationResource.getIntParameter(session, "pwa.content.language.size", 0);

		for (int i = 0; i < langItemSize; i++) {
			String contentLanguageDetail = applicationResource.getParameter(session,
					"pwa.content.language" + (i + 1));
			contentLangSet = updateContentLanguageBean(contentLangSet,
					contentLanguageDetail);
		}
		logger.info("Languages populated with size:" + contentLangSet.size());
		return contentLangSet;
	}

	private List<ContentLanguageBean> updateContentLanguageBean(
			List<ContentLanguageBean> contentLangSet, String contentLanguageDetails) {

		if (null != contentLanguageDetails) {
			String details[] = contentLanguageDetails.split(":");
			if (null != details && details.length == 2) {
				ContentLanguageBean contentLangBean = new ContentLanguageBean(details[0]
						.trim(), details[1].trim());
				contentLangSet.add(contentLangBean);
			}
		}
		return contentLangSet;
	}

	public boolean submitFeedback(String name, String email, String message,
			String category, String oem, String model, String osVersion,
			String appVersion, HttpServletRequest request, HttpSession session,
			Device device) throws StoreServerException {

		boolean result = false;
		FeedbackBean feedbackBean = new FeedbackBean();
		String storeId = utilService.getStoreId(request, session, device);
		String msisdn = utilService.getMsisdn(request, device);

		logger.info("NAME: " + name + ", EMAIL: " + email + ", MESSAGE: " + message
				+ ", CATEGORY: " + category + ", OEM: " + oem + ", OS_VERSION: "
				+ osVersion + ", APP_VERSION: " + appVersion + ", MODEL: " + model);

		feedbackBean.setEmail(email);
		feedbackBean.setMessage(message);
		feedbackBean.setName(name);
		feedbackBean.setCategory(category);
		feedbackBean.setOem(oem);
		feedbackBean.setModel(model);
		feedbackBean.setOs_version(osVersion);
		feedbackBean.setApp_version(appVersion);
		String token = null;

		try {
			token = utilService.getAuthenticationToken(session, msisdn, storeId);
			result = submitUserFeedback(session, feedbackBean, token, storeId);
		} catch (StoreServerException ex) {

			if (AUTH_TOKEN_EXPIRED.equalsIgnoreCase(ex.getCode())) {
				logger.info("Token expired while userfeedback submit, so generating token and hitting the url...");
				token = utilService.getNewAuthenticationToken(session, msisdn, storeId);
				result = submitUserFeedback(session, feedbackBean, token, storeId);
			} else {
				logger.error("Exception while userfeedback submit for : " + msisdn, ex);
				throw ex;
			}
		}
		return result;
	}

	private boolean submitUserFeedback(HttpSession session, FeedbackBean feedbackBean,
			String token, String storeId) throws StoreServerException {

		String url = applicationResource.getParameter(session, "pwa.feedback.url");
		url = url.replace("%CRED_TOKEN%", token);
		url = url.replace("%STORE_ID%", storeId);
		url = webUtils.getUpdatedVoltronUrl(session, url);

		logger.info("feedbackUrl: " + url);

		HttpEntity<FeedbackBean> httpEntity = new HttpEntity<FeedbackBean>(feedbackBean);
		HttpStatus statusCode = null;
		statusCode = voltronInterface.getStatusCodeFromVoltronAPI(session, url,
				HttpMethod.POST, httpEntity, String.class);

		if (null != statusCode && statusCode == HttpStatus.OK) {
			return true;
		}
		return false;
	}

	public String sendCleverTapDetails(String language, String cleverTapUserId,
			String notificationsUserId, String osVersion, String utm_params,
			HttpServletRequest request, HttpSession session, Device device)
			throws StoreServerException {
		logger.info("Inside sendCleverTapDetails(), language: " + language
				+ ", ctUserId: " + cleverTapUserId + ", osVersion: " + osVersion
				+ ", utm_params: " + utm_params);
		try {
			String storeId = utilService.getStoreId(request, session, device);
			String msisdn = utilService.getMsisdn(request, device);

			String userId = null;
			String extUserId = null;
			if (null != msisdn) {
				extUserId = utilService.getUserId(request, session, device);
			}
			if (null != notificationsUserId && !"null".equals(notificationsUserId)) {
				userId = notificationsUserId;
			}

			NotificationsRequestObject ctRequestObject = new NotificationsRequestObject();
			ctRequestObject.setLanguage(language);
			if (null != extUserId) {
				ctRequestObject.setExternal_user_id(extUserId);
			}
			if (null != userId) {
				ctRequestObject.setUser_id(userId);
			}
			
			ctRequestObject.setApplication_version("PWA");
			ctRequestObject.setApplication_identifier("PWA");

			NotificationsSubscription ctSubscription = new NotificationsSubscription();
			ctSubscription.setNotification_mode("native");
			ctSubscription.setProvider_id(cleverTapUserId);
			ctSubscription.setProvider_name("clavier_tap");
			ctSubscription.setEnabled(true);
			ctRequestObject.addSubscription(ctSubscription);

			NotificationsUserAttribute ctUserAttribute = new NotificationsUserAttribute();
			ctUserAttribute.setAttribute_name("os_version");
			ctUserAttribute.setAttribute_value(osVersion);
			ctRequestObject.addUserAttribute(ctUserAttribute);

			Map<String, String> affiliate = webUtils.fromJsonToType(utm_params, new TypeToken<Map<String, String>>() {
			}.getType());
			ctRequestObject.setAffiliate(affiliate);

			String ctRequestObjectStr = webUtils.obtainJSONStringFromObject(ctRequestObject);
			logger.info("notifications request: " + ctRequestObjectStr);

			/*if (null != userId) {
				String getSubscriptionsUrl = applicationResource.getParameter(session,
						"pwa.get.existing.notifications.url");
				getSubscriptionsUrl = getSubscriptionsUrl.replace("%STORE_ID%", storeId);
				getSubscriptionsUrl = getSubscriptionsUrl.replace("%USER_ID%", userId);
				logger.info("Going to hit get existing notifications url: " + getSubscriptionsUrl);

				try {
					// GET request will give the existing entry from DB in voltron side
					String getResponse = voltronInterface.hitVoltronAPI(session, getSubscriptionsUrl,
							WebConstants.REQUEST_GET, ctRequestObject, String.class);
					logger.info("Get response from voltron: " + getResponse);

					return getResponse;
				} catch (StoreServerException e) {
					logger.info("No data found in Voltron DB for provided storeId: " + storeId + ", userId: " + userId);
					// ctUserExists = false;
				}
			} else {*/
				String createUpdateSubscriptionsUrl = applicationResource.getParameter(session,
						"pwa.create.update.notifications.url");
				createUpdateSubscriptionsUrl = createUpdateSubscriptionsUrl.replace("%STORE_ID%", storeId);
				logger.info("Going to hit create/update notifications url: " + createUpdateSubscriptionsUrl);
				// POST request will create new entry in DB in voltron side
				String postResponse = voltronInterface.hitVoltronAPI(session, createUpdateSubscriptionsUrl,
						WebConstants.REQUEST_POST, ctRequestObjectStr, String.class);
				logger.info("Post response from voltron: " + postResponse);
				return postResponse;
//			}
		} catch (StoreServerException e) {
			logger.error("Exception while calling create subscription Voltron api for CleverTap token for: " + e);
			throw e;
		}
//		return null;
	}
	
	public String getMadeUrl(String type, String madeContext, String madeRefId,
			HttpSession session) {

		String madeUrl = applicationResource.getParameter(session, "pwa.made.url");

		logger.info("In FeatureService madeContext: " + madeContext + ", madeRefId: "
				+ madeRefId);

		String mediaExtension = null;
		String encryptedString = "";
		madeUrl = madeUrl.replace("%MADE_CONTEXT%", madeContext);
		if (type.equalsIgnoreCase("video")) {
			logger.info("In FeatureService:: made request for video");
			mediaExtension = applicationResource.getParameter(session, "pwa.made.video.extension");
			encryptedString = encryptVideoUrl(madeRefId);
		} else if (type.equalsIgnoreCase("audio")) {
			logger.info("In FeatureService:: made request for audio");
			mediaExtension = applicationResource.getParameter(session, "pwa.made.audio.extension");
			encryptedString = encryptAudioUrl(madeRefId);
		}
		madeUrl = madeUrl.replace("%MADE_ENCODED_STRING%", encryptedString);
		madeUrl = madeUrl.replace("%EXTENSION%", mediaExtension);
		logger.info("In FeatureService, made final url after encryption: " + madeUrl);
		
		ResponseWrapper responseWrapper = new ResponseWrapper();
		responseWrapper.setResult(madeUrl);
		return webUtils.obtainJSONFromObject(responseWrapper);	
	}
	
	private String encryptAudioUrl(String madeRefId) {
		/*
         * String format is GMT time in second ((day of the year) * 86400 + (hour of the
         * day (0-23) * 3600 ) + (minute of the hour * 60 ) + (secs elapsed in current
         * minute)) Clip rule info -- example 3$pre$name$post#bg Stream start time on
         * clip in millisecond. Value should be 0 for the Strring MSISDN (Hard coded
         * value) Client token (Random value) Device model name (Configured value) App
         * version (Configured value)
         */
		
        Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("GMT"));
        int dayOfYear = calendar.get(Calendar.DAY_OF_YEAR) - 1;
        int hourOfDay = calendar.get(Calendar.HOUR_OF_DAY);
        int min = calendar.get(Calendar.MINUTE);
        int second = calendar.get(Calendar.SECOND);
        logger.info("DayOfYear:: " + dayOfYear + ", HourOfDay:: " + hourOfDay + ", MINUTE:: " + min + ", SECONDL:: "
                + second);
        
        int dayOfYear_p = dayOfYear * 86400;
        int hourOfDay_p = hourOfDay * 3600;
        int min_p = min * 60;
        logger.info("DayOfYear_p:: " + dayOfYear_p + ", HourOfDay_p:: " + hourOfDay_p + ", MINUTE_p:: " + min_p
                + ", SECONDL:: " + second);
        
        String[] token = new String[9];
        token[0] = "" + (dayOfYear_p + hourOfDay_p + min_p + second);
        token[1] = "clipid=" + madeRefId;
        token[2] = "streaming=0";
        token[3] = "msisdn=1111111111";
        token[4] = "ClientToken="+100000 + (int) (new Random().nextFloat() * 900000) + "";
        token[5] = "model=Voltron_Strring";
        token[6] = "appId=3.0";
        token[7] = "starttime=0";
        token[8] = "info=voltron_made_encryption";
        //token[9] = "songname="+songName;
        
        String toEncrypt = "";
        for (String s : token) {
            toEncrypt += s + ",";
        }
        logger.info("To be Encrypt string is :: " + toEncrypt);
        return getEncryptedString(token);

	}

	private String encryptVideoUrl(String madeRefId) {

		/*
		 * String format is GMT time in second ((day of the year) * 86400 + (hour of the
		 * day (0-23) * 3600 ) + (minute of the hour * 60 ) + (secs elapsed in current
		 * minute)) Clip rule info -- example 3$pre$name$post#bg Stream start time on
		 * clip in millisecond. Value should be 0 for the Strring MSISDN (Hard coded
		 * value) Client token (Random value) Device model name (Configured value) App
		 * version (Configured value)
		 */

		Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("GMT"));

		int dayOfYear = calendar.get(Calendar.DAY_OF_YEAR) - 1;
		int hourOfDay = calendar.get(Calendar.HOUR_OF_DAY);
		int min = calendar.get(Calendar.MINUTE);
		int second = calendar.get(Calendar.SECOND);

		logger.info("DayOfYear:: " + dayOfYear + ", HourOfDay:: " + hourOfDay + ", MINUTE:: " + min + ", SECONDL:: "
				+ second);

		int dayOfYear_p = dayOfYear * 86400;
		int hourOfDay_p = hourOfDay * 3600;
		int min_p = min * 60;

		logger.info("DayOfYear_p:: " + dayOfYear_p + ", HourOfDay_p:: " + hourOfDay_p + ", MINUTE_p:: " + min_p
				+ ", SECONDL:: " + second);
		String[] token = new String[5];
		token[0] = "" + (dayOfYear_p + hourOfDay_p + min_p + second);
		token[1] = "clipid=" + madeRefId;
		token[2] = "cutduration=0";
		token[3] = "info=browser";
		token[4] = "streaming=1";

		String toEncrypt = "";

		for (String s : token) {
			toEncrypt += s + ",";
		}

		logger.info("To be Encrypt string is :: " + toEncrypt);

		String encryptedString = getEncryptedString(token);
		return encryptedString;
		
	}

	CryptoProvider getCryptoProvider() {
		return cryptoProvider;
	}

	public void setCryptoProvider(CryptoProvider cryptoProvider) {
		this.cryptoProvider = cryptoProvider;
	}

	private String getEncryptedString(String[] token) {
		return getCryptoProvider().encrypt(token);
	}

	private String removeBannerFilterForClassOfService(String bannerUrl) {

		if (bannerUrl.contains("%CLASS_OF_SERVICE%")) {
			bannerUrl = bannerUrl.replace("&filter=classOfService:%CLASS_OF_SERVICE%", "");
			bannerUrl = bannerUrl.replace("filter=classOfService:%CLASS_OF_SERVICE%", "");
		}
		return bannerUrl;
	}

	private String removeBannerFilterForUserType(String bannerUrl) {

		if (bannerUrl.contains("%USER_TYPE%")) {
			bannerUrl = bannerUrl.replace("&filter=userType:%USER_TYPE%", "");
			bannerUrl = bannerUrl.replace("filter=userType:%USER_TYPE%", "");
		}
		return bannerUrl;
	}

	private String removeBannerFilterForUserStatus(String bannerUrl) {

		if (bannerUrl.contains("%USER_STATUS%")) {
			bannerUrl = bannerUrl.replace("&filter=userStatus:%USER_STATUS%", "");
			bannerUrl = bannerUrl.replace("filter=userStatus:%USER_STATUS%", "");
		}
		return bannerUrl;
	}

}
