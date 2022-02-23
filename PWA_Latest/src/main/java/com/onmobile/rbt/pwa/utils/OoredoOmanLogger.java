package com.onmobile.rbt.pwa.utils;

import java.text.SimpleDateFormat;
import java.util.Date;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.message.ObjectArrayMessage;

public class OoredoOmanLogger {

	private static final Logger logger = LogManager.getLogger(OoredoOmanLogger.class);

	public static void writeCDRLog(HttpServletRequest request, String msisdn, String token, String correlatorId,
			String dateFormat) {

		String userAgent = request.getHeader("user-agent");
		String ipAddress = request.getHeader("X-FORWARDED-FOR");
		if (ipAddress == null) {
			ipAddress = request.getRemoteAddr();
		} else {
			ipAddress = ipAddress.split(",")[0];
		}
		// TIMESTAMP,TOKEN,MSISDN,CORRELATORID,SOURCE_IP,USER_AGENT

		logger.info(new ObjectArrayMessage(getTimeForLog(dateFormat), token, msisdn, correlatorId, ipAddress,
				userAgent));
	}

	private static String getTimeForLog(String dateFormat) {
		SimpleDateFormat sdf = new SimpleDateFormat(dateFormat);
		String currentTime = sdf.format(new Date());
		return currentTime;
	}

}
