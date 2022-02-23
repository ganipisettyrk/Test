package com.onmobile.rbt.pwa.utils.AESUtilities;

import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.InvalidParameterException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.KeyGenerator;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.SecretKey;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import org.apache.commons.codec.binary.Base64;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public final class OoredoAESUtils {

	private static final Logger logger = LogManager.getLogger(OoredoAESUtils.class);

	private static final int AES_KEY_SIZE_BITS = 256;
	private static final int INITIALIZATION_VECTOR_SIZE_BITS = 128;
	private static final String SYMMETRIC_KEY_CRYPTO_ALGO = "AES";
	private static final String ALGO_TRANSFORMATION_STRING = "AES/CBC/PKCS5Padding";
	private static final Charset CHARACTER_ENCODING = StandardCharsets.UTF_8;

	/**
	 * Returns a base64 encoded 256 bit AES key and an initialization vector which
	 * will be used for encryption in CBC mode for an established session between
	 * the client and server. This would need JCE Unlimited strength files to be
	 * installed explicitly to the JVM. If they are not installed this method will
	 * throw an exception.
	 */

	public static OoredoAESContext generateAESContext() {
		SecretKey aesKey = null;
		try {

			KeyGenerator keygen = KeyGenerator.getInstance(SYMMETRIC_KEY_CRYPTO_ALGO);
			/**
			 * Specifying Key size to be used, Note: This would need JCE Unlimited Strength
			 * to be installed explicitly
			 */
			keygen.init(AES_KEY_SIZE_BITS);
			aesKey = keygen.generateKey();

			SecureRandom secureRandom = new SecureRandom();
			byte[] initializationVector = new byte[INITIALIZATION_VECTOR_SIZE_BITS / 8];
			secureRandom.nextBytes(initializationVector);

			return new OoredoAESContext.AESContextBuilder().aesKey(aesKey.getEncoded())
					.base64EncodedAesKey(Base64.encodeBase64String(aesKey.getEncoded()))
					.aesKeySizeInBytes(AES_KEY_SIZE_BITS / 8).initializationVector(initializationVector)
					.base64EncodedIV(Base64.encodeBase64String(initializationVector)).build();

		} catch (NoSuchAlgorithmException nsae) {
			logger.error("NoSuchAlgorithmException occurred. Key being request is "
					+ "for AES algorithm, but this cryptographic " + "algorithm is not available in the environment, "
					+ nsae);
			return null;
		} catch (InvalidParameterException ipe) {
			logger.error("InvalidParameterException occurred. Key being request is "
					+ "for AES algorithm, but 256 bit key cannot be generated. "
					+ "Please install the JCE Unlimited Strength files, " + ipe);
			return null;
		}
	}

	public static String encrypt(String clearTextMessage, byte[] aesKey, byte[] initializationVector) {

		Cipher c = null;
		byte[] cipherTextInByteArr = null;
		IvParameterSpec spec = new IvParameterSpec(initializationVector);

		try {
			c = Cipher.getInstance(ALGO_TRANSFORMATION_STRING); // Transformation specifies algorithm,mode of operation
		} catch (NoSuchAlgorithmException nsae) {
			logger.error("NoSuchAlgorithmException while encrypting. Algorithm being "
					+ "requested is not available in this environment, " + nsae);
		} catch (NoSuchPaddingException nspe) {
			logger.error("NoSuchPaddingException while encrypting. Padding Scheme "
					+ "being requested is not available this environment, " + nspe);
		}

		if (null != c) {
			try {
				c.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(aesKey, SYMMETRIC_KEY_CRYPTO_ALGO), spec);
			} catch (InvalidKeyException ike) {
				logger.error("InvalidKeyException while encrypting. Key being used is "
						+ "not valid. It could be due to invalid encoding, wrong length or uninitialized, " + ike);

			} catch (InvalidAlgorithmParameterException iape) {
				logger.error("InvalidAlgorithmParameterException while encrypting. "
						+ "Parameters passed to algorithm initialization are invalid, " + iape);
			}

			try {
				cipherTextInByteArr = c.doFinal(clearTextMessage.getBytes(CHARACTER_ENCODING));
			} catch (IllegalBlockSizeException ibse) {
				logger.error("IllegalBlockSizeException while encrypting, due to invalid block size, " + ibse);
			} catch (BadPaddingException bpe) {
				logger.error("BadPaddingException while encrypting, due to invalid padding scheme, " + bpe);
			}

		}

		if (null != cipherTextInByteArr) {
			return Base64.encodeBase64String(cipherTextInByteArr);
		} else {
			return null;
		}

	}

	public static String decrypt(String base64EncodedEncryptedMessage, byte[] aesKey, byte[] initializationVector) {
		Cipher c = null;
		byte[] plainTextInByteArr = null;

		IvParameterSpec spec = new IvParameterSpec(initializationVector);

		try {
			c = Cipher.getInstance(ALGO_TRANSFORMATION_STRING);
		} catch (NoSuchAlgorithmException nsae) {
			logger.error("NoSuchAlgorithmException while decrypting. Algorithm being "
					+ "requested is not available in environment, " + nsae);
		} catch (NoSuchPaddingException nspe) {
			logger.error("NoSuchPaddingException while decrypting. Padding scheme being "
					+ "requested is not available in environment, " + nspe);
		}

		if (null != c) {
			try {
				c.init(Cipher.DECRYPT_MODE, new SecretKeySpec(aesKey, SYMMETRIC_KEY_CRYPTO_ALGO), spec);
			} catch (InvalidKeyException ike) {
				logger.error("InvalidKeyException while decrypting. Key being used is not valid. "
						+ "It could be due to invalid encoding, wrong length or uninitialized, " + ike);
			} catch (InvalidAlgorithmParameterException iape) {
				logger.error(
						"InvalidAlgorithmParameterException while decrypting. Iv Parameter spec is not valid, " + iape);
			}

			try {
				plainTextInByteArr = c.doFinal(Base64.decodeBase64(base64EncodedEncryptedMessage));
			} catch (IllegalBlockSizeException ibse) {
				logger.error("IllegalBlockSizeException while decryption, due to block size, " + ibse);

			} catch (BadPaddingException bpe) {
				logger.error("BadPaddingException while decryption, due to padding scheme, " + bpe);
			}
		}

		if (null != plainTextInByteArr) {
			return new String(plainTextInByteArr, CHARACTER_ENCODING);
		} else {
			return null;
		}
	}

	public static String encrypt(String clearTextMessage, String aesKey, String base64EncodedIV) {
		return encrypt(clearTextMessage, Base64.decodeBase64(aesKey), Base64.decodeBase64(base64EncodedIV));
	}

	public static String decrypt(String base64EncodedEncryptedMessage, String aesKey, String base64EncodedIV)
			throws Exception {
		return decrypt(base64EncodedEncryptedMessage, Base64.decodeBase64(aesKey),
				Base64.decodeBase64(base64EncodedIV));
	}

}
