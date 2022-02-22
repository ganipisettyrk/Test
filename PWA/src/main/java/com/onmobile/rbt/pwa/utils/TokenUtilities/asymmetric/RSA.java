package com.onmobile.rbt.pwa.utils.TokenUtilities.asymmetric;

import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public final class RSA {

	private RSA() {

	}

	private static final Logger logger = LogManager.getLogger(RSA.class);

	static final int RSA_KEY_LENGTH = 2048;

	static final String KEY_AGREEMENT_ALGORITHM_NAME = "RSA";
	static final String PADDING_SCHEME = "PKCS1Padding";
	static final String MODE_OF_OPERATION = "ECB";
	static final Charset CHARACTER_ENCODING = StandardCharsets.UTF_8;

	public static String encrypt(String clearTextMessage, byte[] rsaPublicKey) {
		return encrypt(clearTextMessage.getBytes(CHARACTER_ENCODING), rsaPublicKey);
	}

	public static String encrypt(String clearTextMessage, String base64EncodedRsaPublicKey) {
		return encrypt(clearTextMessage, Base64.getDecoder().decode(base64EncodedRsaPublicKey));
	}

	public static byte[] decrypt(String base64EncodedCipherText, byte[] rsaPrivateKey) {
		PrivateKey privateKey = null;
		PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(rsaPrivateKey);
		KeyFactory keyFactory = null;
		try {
			keyFactory = KeyFactory.getInstance(KEY_AGREEMENT_ALGORITHM_NAME);
			privateKey = keyFactory.generatePrivate(keySpec);
		} catch (NoSuchAlgorithmException nsae) {
			logger.error(
					"NoSuchAlgorithmException occurred while decrypting. Key being request is for RSA algorithm, but this cryptographic "
							+ "algorithm is not available in the environment.");
			throw new AsymmetricCryptographyException(
					"NoSuchAlgorithmException occurred while decrypting. Key being request is for RSA algorithm, but this cryptographic "
							+ "algorithm is not available in the environment.",
					nsae);
		} catch (InvalidKeySpecException ikse) {
			logger.error(
					"InvalidKeySpecException while decrypting. Key being used is not valid. It could be due to invalid encoding, wrong length or uninitialized.");
			throw new AsymmetricCryptographyException(
					"InvalidKeySpecException while decrypting. Key being used is not valid. It could be due to invalid encoding, wrong length or uninitialized.",
					ikse);
		}

		Cipher cipher = null;
		try {
			cipher = Cipher.getInstance(KEY_AGREEMENT_ALGORITHM_NAME + "/" + MODE_OF_OPERATION + "/" + PADDING_SCHEME);
		} catch (NoSuchAlgorithmException nsae) {
			logger.error(
					"NoSuchAlgorithmException occurred in decryption while initializing cipher. Key being request is for RSA algorithm, but this cryptographic "
							+ "algorithm is not available in the environment.");
			throw new AsymmetricCryptographyException(
					"NoSuchAlgorithmException occurred in decryption while initializing cipher. Key being request is for RSA algorithm, but this cryptographic "
							+ "algorithm is not available in the environment.",
					nsae);
		} catch (NoSuchPaddingException nspe) {
			logger.error(
					"NoSuchPaddingException while decrypting. Padding Scheme being requested is not available this environment.");
			throw new AsymmetricCryptographyException(
					"NoSuchPaddingException while decrypting. Padding Scheme being requested is not available this environment.",
					nspe);
		}

		byte[] plainTextInByteArr = null;
		try {
			cipher.init(Cipher.DECRYPT_MODE, privateKey);
			plainTextInByteArr = cipher.doFinal(Base64.getDecoder().decode(base64EncodedCipherText));
		} catch (InvalidKeyException ike) {
			logger.error(
					"InvalidKeyException while decrypting. Key being used is not valid. It could be due to invalid encoding, wrong length or uninitialized.");
			throw new AsymmetricCryptographyException(
					"InvalidKeyException while decrypting. Key being used is not valid. It could be due to invalid encoding, wrong length or uninitialized.",
					ike);
		} catch (IllegalBlockSizeException ibse) {
			logger.error("IllegalBlockSizeException while decrypting, due to invalid block size.");
			throw new AsymmetricCryptographyException(
					"IllegalBlockSizeException while decrypting, due to invalid block size.", ibse);
		} catch (BadPaddingException bpe) {
			logger.error("BadPaddingException while decrypting, due to invalid padding scheme.");
			throw new AsymmetricCryptographyException(
					"BadPaddingException while decrypting, due to invalid padding scheme.", bpe);
		}
		return plainTextInByteArr;
	}

	public static byte[] decrypt(String base64EncodedCipherText, String base64EncodedRsaPrivateKey) {
		return decrypt(base64EncodedCipherText, Base64.getDecoder().decode(base64EncodedRsaPrivateKey));
	}

	public static String encrypt(byte[] data, byte[] rsaPublicKey) {

		X509EncodedKeySpec keySpec = new X509EncodedKeySpec(rsaPublicKey);
		PublicKey publicKey = null;

		try {
			KeyFactory keyFactory = KeyFactory.getInstance(KEY_AGREEMENT_ALGORITHM_NAME);
			publicKey = keyFactory.generatePublic(keySpec);
		} catch (NoSuchAlgorithmException nsae) {
			logger.error(
					"NoSuchAlgorithmException occurred while encrypting. Key being request is for RSA algorithm, but this cryptographic "
							+ "algorithm is not available in the environment.");
			throw new AsymmetricCryptographyException(
					"NoSuchAlgorithmException occurred while encrypting. Key being request is for RSA algorithm, but this cryptographic "
							+ "algorithm is not available in the environment.",
					nsae);
		} catch (InvalidKeySpecException ikse) {
			logger.error(
					"InvalidKeySpecException while encrypting. Key being used is not valid. It could be due to invalid encoding, wrong length or uninitialized.");
			throw new AsymmetricCryptographyException(
					"InvalidKeySpecException while encrypting. Key being used is not valid. It could be due to invalid encoding, wrong length or uninitialized.",
					ikse);
		}

		Cipher cipher = null;
		try {
			cipher = Cipher.getInstance(KEY_AGREEMENT_ALGORITHM_NAME + "/" + MODE_OF_OPERATION + "/" + PADDING_SCHEME);
		} catch (NoSuchAlgorithmException nsae) {
			logger.error(
					"NoSuchAlgorithmException occurred in encryption while initializing cipher. Key being request is for RSA algorithm, but this cryptographic "
							+ "algorithm is not available in the environment.");
			throw new AsymmetricCryptographyException(
					"NoSuchAlgorithmException occurred in encryption while initializing cipher. Key being request is for RSA algorithm, but this cryptographic "
							+ "algorithm is not available in the environment.",
					nsae);
		} catch (NoSuchPaddingException nspe) {
			logger.error(
					"NoSuchPaddingException while encrypting. Padding Scheme being requested is not available this environment.");
			throw new AsymmetricCryptographyException(
					"NoSuchPaddingException while encrypting. Padding Scheme being requested is not available this environment.",
					nspe);
		}

		byte[] cipherTextInByteArr = null;
		try {
			cipher.init(Cipher.ENCRYPT_MODE, publicKey);
			cipherTextInByteArr = cipher.doFinal(data);
		} catch (InvalidKeyException ike) {
			logger.error(
					"InvalidKeyException while encrypting. Key being used is not valid. It could be due to invalid encoding, wrong length or uninitialized.");
			throw new AsymmetricCryptographyException(
					"InvalidKeyException while encrypting. Key being used is not valid. It could be due to invalid encoding, wrong length or uninitialized.",
					ike);
		} catch (IllegalBlockSizeException ibse) {
			logger.error("IllegalBlockSizeException while encrypting, due to invalid block size.");
			throw new AsymmetricCryptographyException(
					"IllegalBlockSizeException while encrypting, due to invalid block size.", ibse);
		} catch (BadPaddingException bpe) {
			logger.error("BadPaddingException while encrypting, due to invalid padding scheme.");
			throw new AsymmetricCryptographyException(
					"BadPaddingException while encrypting, due to invalid padding scheme.", bpe);
		}
		return Base64.getEncoder().encodeToString(cipherTextInByteArr);
	}

	public static String encrypt(byte[] data, String rsaPublicKey) {
		return encrypt(data, Base64.getDecoder().decode(rsaPublicKey));
	}

}
