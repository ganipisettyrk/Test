package com.onmobile.rbt.pwaseo.utils;

public class StoreServerException extends Throwable {

	private static final long serialVersionUID = -7558445183481622794L;
	public static final String STATUS_FAILURE = "failure";

	private String status = STATUS_FAILURE;
	private String description;
	private String code;
	private String subCode;

	public StoreServerException() {
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

}
