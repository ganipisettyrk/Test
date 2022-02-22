package com.onmobile.rbt.pwa.utils.TokenUtilities.hmac;

import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.List;

import javax.crypto.KeyGenerator;
import javax.crypto.Mac;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public final class HMAC {

	private static final Logger logger = LogManager.getLogger(HMAC.class);

	public static final String MAC_ALGO = "HmacSHA256";
	public static final int HMAC_KEY_SIZE_BITS = 256;
	private static final Charset CHARACTER_ENCODING = StandardCharsets.UTF_8;

	public static HMACContext generateHMAContext() {
		try {
			KeyGenerator keyGenerator = KeyGenerator.getInstance(MAC_ALGO);

			keyGenerator.init(HMAC_KEY_SIZE_BITS);
			SecretKey hmacKey = keyGenerator.generateKey();

			return new HMACContext.HMACContextBuilder().hmacKey(hmacKey.getEncoded())
					.base64EncodedHmacKey(Base64.getEncoder().encodeToString(hmacKey.getEncoded()))
					.hmacKeySizeInBytes(HMAC_KEY_SIZE_BITS / 8).build();
		} catch (NoSuchAlgorithmException nsae) {
			logger.error(
					"NoSuchAlgorithmException occurred. Key being request is for HMAC algorithm, but this cryptographic "
							+ "algorithm is not available in the environment.");
			throw new MACException(
					"NoSuchAlgorithmException occurred. Key being request is for HMAC algorithm, but this cryptographic "
							+ "algorithm is not available in the environment.",
					nsae);
		}

	}

	public static String prepareHMAC(byte[] hmacKey, byte[] input) {
		try {
			SecretKey keySpec = new SecretKeySpec(hmacKey, MAC_ALGO);
			Mac mac = Mac.getInstance(MAC_ALGO);
			mac.init(keySpec);
			byte[] macBytes = mac.doFinal(input);
			return Base64.getEncoder().encodeToString(macBytes);
		} catch (NoSuchAlgorithmException nsae) {
			logger.error(
					"NoSuchAlgorithmException occurred. Key being request is for HMAC algorithm, but this cryptographic "
							+ "algorithm is not available in the environment.");
			throw new MACException(
					"NoSuchAlgorithmException occurred. Key being request is for HMAC algorithm, but this cryptographic "
							+ "algorithm is not available in the environment.",
					nsae);
		} catch (InvalidKeyException ike) {
			logger.error(
					"InvalidKeyException while preparing MAC. Key being used is not valid. It could be due to invalid encoding, wrong length or uninitialized.");
			throw new MACException(
					"InvalidKeyException while preparing MAC. Key being used is not valid. It could be due to invalid encoding, wrong length or uninitialized.",
					ike);
		}

	}

	public static String prepareHMAC(byte[] hmacKey, List<String> inputData) {
		StringBuilder dataBuilder = new StringBuilder();
		for (String token : inputData) {
			dataBuilder.append(token);
		}
		return prepareHMAC(hmacKey, dataBuilder.toString().getBytes(CHARACTER_ENCODING));
	}

	public static String prepareHMAC(String base64EncodedHmacKey, byte[] inputData) {
		return prepareHMAC(Base64.getDecoder().decode(base64EncodedHmacKey), inputData);
	}

	public static String prepareHMAC(String base64EncodedHmacKey, List<String> inputData) {
		StringBuilder dataBuilder = new StringBuilder();
		for (String token : inputData) {
			dataBuilder.append(token);
		}
		return prepareHMAC(Base64.getDecoder().decode(base64EncodedHmacKey),
				dataBuilder.toString().getBytes(CHARACTER_ENCODING));
	}

}
