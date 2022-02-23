package com.onmobile.rbt.pwa.crypto.utils;

public class MadeCryptoException extends RuntimeException {

	private static final long serialVersionUID = 8580064774303239488L;

	public MadeCryptoException() {
		super();
	}

	public MadeCryptoException(String arg0, Throwable arg1, boolean arg2, boolean arg3) {
		super(arg0, arg1, arg2, arg3);
	}

	public MadeCryptoException(String arg0, Throwable arg1) {
		super(arg0, arg1);
	}

	public MadeCryptoException(String arg0) {
		super(arg0);
	}

	public MadeCryptoException(Throwable arg0) {
		super(arg0);
	}

}
