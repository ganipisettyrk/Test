package com.onmobile.rbt.pwa.utils.ErrorHandling;

import com.onmobile.rbt.pwa.utils.WebConstants;

public class PWAException extends Throwable implements WebConstants {

	private static final long serialVersionUID = -7558445183481622794L;

	private String status = STATUS_FAILURE;
	private String description;
	private String code;
	private String subCode;

	public PWAException() {
		super();
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public String getSubCode() {
		return subCode;
	}

	public void setSubCode(String subCode) {
		this.subCode = subCode;
	}

	@Override
	public synchronized Throwable fillInStackTrace() {
		return this;
	}
}