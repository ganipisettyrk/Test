package com.onmobile.rbt.pwa.utils.TokenUtilities.hmac;

public class MACException extends RuntimeException {

	private static final long serialVersionUID = 4426232191976521768L;

	public MACException(String message) {
		super(message);
	}

	public MACException(String message, Throwable t) {
		super(message, t);
	}

}
