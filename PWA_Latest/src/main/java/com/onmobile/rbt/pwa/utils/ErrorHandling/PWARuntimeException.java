package com.onmobile.rbt.pwa.utils.ErrorHandling;

public class PWARuntimeException extends RuntimeException {

	private static final long serialVersionUID = 1L;

	private String message ;
	private String status;
	private int status_code;

	public PWARuntimeException() {
	}

	public PWARuntimeException(String message, String status, int status_code) {
		this.message = message;
		this.status = status;
		this.status_code = status_code;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public int getStatus_code() {
		return status_code;
	}

	public void setStatus_code(int status_code) {
		this.status_code = status_code;
	}

	@Override
	public synchronized Throwable fillInStackTrace() {
		return this;
	}
}