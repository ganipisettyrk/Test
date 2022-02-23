package com.onmobile.rbt.pwa.utils.ContestUtilities;

import java.util.Base64;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class ContestUtils {

	private static final Logger logger = LogManager.getLogger(ContestUtils.class);

	public static String encrypt(String message, String key, String initVector) {
		try {

			IvParameterSpec iv = new IvParameterSpec(initVector.getBytes("UTF-8"));
			SecretKeySpec skeySpec = new SecretKeySpec(key.getBytes("UTF-8"), "AES");

			Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5PADDING");
			cipher.init(Cipher.ENCRYPT_MODE, skeySpec, iv);

			byte[] encrypted = cipher.doFinal(message.getBytes());
			return new String(Base64.getEncoder().encode(encrypted));

		} catch (Exception ex) {
			logger.error("Exception while encoding", ex);

		}
		return null;
	}

	public static String decrypt(String encrypted, String key, String initVector) {
		try {
			IvParameterSpec iv = new IvParameterSpec(initVector.getBytes("UTF-8"));
			SecretKeySpec skeySpec = new SecretKeySpec(key.getBytes("UTF-8"), "AES");

			Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5PADDING");
			cipher.init(Cipher.DECRYPT_MODE, skeySpec, iv);
			byte[] original = cipher.doFinal(Base64.getDecoder().decode(encrypted));

			return new String(original);

		} catch (Exception ex) {
			logger.error("Exception while decoding", ex);

		}
		return null;
	}
}
