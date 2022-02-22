package com.onmobile.rbt.pwa.utils.TokenUtilities.utilities;

import java.util.Date;

public class ByteConversionUtility {

	/**
	 * Encrypted current-time, SYMMETRIC-KEY, HMAC-KEY Key encryption bytes order:
	 * first 4 bytes - unix epoch seconds next 2 bytes - symmetric-key size next
	 * symmetric-key bytes next 2 bytes hmac-key size next hmac-key bytes
	 * 
	 * int keyExchangeSize = 4+2+symmetricKeySize+2+hmacKeySize
	 */
	public static byte[] prepareKeyExchangeBytes(final int unixEpochSeconds, final int symmetricKeySizeInBytes,
			final byte[] symmetricKey, final int hmacKeySizeInBytes, final byte[] hmacKey) {

		if (symmetricKey == null || hmacKey == null) {
			throw new IllegalArgumentException("symmetricKey or hmacKey cannot be null!");
		}

		/**
		 * In two bytes we can keep 0 to 65535 (2^16 -1)
		 * 
		 */
		final int _2byteMaxRange = 65535;
		if (symmetricKeySizeInBytes > _2byteMaxRange || hmacKeySizeInBytes > _2byteMaxRange) {
			throw new IllegalArgumentException("symmetricKey or hmacKey max limit is :" + _2byteMaxRange);

		}

		if (symmetricKey.length != symmetricKeySizeInBytes) {
			throw new IllegalArgumentException("symmetricKeySize not matches  to the symmetricKey bytes");
		}

		if (hmacKey.length != hmacKeySizeInBytes) {
			throw new IllegalArgumentException("hmacKeySize not matches  to the hmacKey bytes");
		}

		final int keyExchangeSize = 4 + 2 + symmetricKeySizeInBytes + 2 + hmacKeySizeInBytes;

		byte[] keyExchange = new byte[keyExchangeSize];

		// copy epoch bytes
		System.arraycopy(intToBytes(unixEpochSeconds), 0, keyExchange, 0, 4);

		System.arraycopy(intTo2Bytes(symmetricKeySizeInBytes), 0, keyExchange, 4, 2);

		System.arraycopy(symmetricKey, 0, keyExchange, 4 + 2, symmetricKeySizeInBytes);

		System.arraycopy(intTo2Bytes(hmacKeySizeInBytes), 0, keyExchange, 4 + 2 + symmetricKeySizeInBytes, 2);

		System.arraycopy(hmacKey, 0, keyExchange, 4 + 2 + symmetricKeySizeInBytes + 2, hmacKeySizeInBytes);

		return keyExchange;
	}

	/**
	 * 
	 * Converts the UNIX epoch seconds into 4 bytes
	 */
	public static byte[] convertUnixEpochSecondsTo4Bytes() {
		int unixEpoch = (int) (System.currentTimeMillis() / 1000);
		return intToBytes(unixEpoch);
	}

	public static Date convertUnixEpochSecondsByteToDate(byte[] unixEpochSeconds) {
		return new Date(convertByteArrayToInt(unixEpochSeconds) * 1000L);
	}

	/**
	 * since int is 4 byte in java, so shift order is 24,16,8,0.
	 */
	public static byte[] intToBytes(final int data) {
		return new byte[] { (byte) ((data >> 24) & 0xff), (byte) ((data >> 16) & 0xff),
				(byte) ((data >> 8) & 0xff), (byte) ((data) & 0xff) };
	}

	public static int convertByteArrayToInt(byte[] data) {
		if (data == null || data.length != 4)
			return 0x0;
		return (int) ((0xff & data[0]) << 24 | (0xff & data[1]) << 16
				| (0xff & data[2]) << 8 | (0xff & data[3]));
	}

	/**
	 * just take first two bytes from LSB. in to bytes we can keep 2^16 - 1 = 65535
	 * 
	 * to test the validity of conversion:
	 * System.out.println(convert2ByteToInt(intTo2Bytes(65535))); should print the
	 * 65535
	 */
	public static byte[] intTo2Bytes(final int data) {
		return new byte[] { (byte) ((data >> 8) & 0xff), (byte) ((data) & 0xff) };
	}

	public static int convert2ByteToInt(byte[] data) {
		if (data == null || data.length != 2)
			return 0x0;
		return (int) ((0xff & data[0]) << 8 | (0xff & data[1]));
	}

}
