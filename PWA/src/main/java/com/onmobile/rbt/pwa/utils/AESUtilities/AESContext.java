package com.onmobile.rbt.pwa.utils.AESUtilities;

public final class AESContext {

	private final byte[] aesKey;
	private final String base64EncodedAesKey;
	private final int aesKeySizeInBytes;

	private final byte[] initializationVector;
	private final String base64EncodedIV;

	private AESContext(AESContextBuilder builder) {
		super();
		this.aesKey = builder.aesKey;
		this.base64EncodedAesKey = builder.base64EncodedAesKey;
		this.aesKeySizeInBytes = builder.aesKeySizeInBytes;
		this.initializationVector = builder.initializationVector;
		this.base64EncodedIV = builder.base64EncodedIV;
	}

	public final byte[] getAesKey() {
		return aesKey.clone();
	}

	public final String getBase64EncodedAesKey() {
		return base64EncodedAesKey;
	}

	public final int getAesKeySizeInBytes() {
		return aesKeySizeInBytes;
	}

	public final byte[] getInitializationVector() {
		return initializationVector.clone();
	}

	public final String getBase64EncodedIV() {
		return base64EncodedIV;
	}

	public static class AESContextBuilder {

		private byte[] aesKey;
		private String base64EncodedAesKey;
		private int aesKeySizeInBytes;

		private byte[] initializationVector;
		private String base64EncodedIV;

		public AESContextBuilder aesKey(byte[] aesKey) {
			this.aesKey = aesKey;
			return this;
		}

		public AESContextBuilder base64EncodedAesKey(String base64EncodedAesKey) {
			this.base64EncodedAesKey = base64EncodedAesKey;
			return this;
		}

		public AESContextBuilder aesKeySizeInBytes(int aesKeySizeInBytes) {
			this.aesKeySizeInBytes = aesKeySizeInBytes;
			return this;
		}

		public AESContextBuilder initializationVector(byte[] initializationVector) {
			this.initializationVector = initializationVector;
			return this;
		}

		public AESContextBuilder base64EncodedIV(String base64EncodedIV) {
			this.base64EncodedIV = base64EncodedIV;
			return this;
		}

		public AESContext build() {
			return new AESContext(this);
		}

	}

}
