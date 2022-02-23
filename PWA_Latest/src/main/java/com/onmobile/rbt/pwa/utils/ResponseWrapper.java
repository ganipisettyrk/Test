package com.onmobile.rbt.pwa.utils;

public class ResponseWrapper {
	private String result;
	private String description;
	private int statusCode;
	private String storeId;
	private boolean isLoggedIn;
	private boolean isHeaderUser;
	private String encryptedMsisdn;
	private String uniqueId;
	private String encryptedUUID; 
	
	public String getUniqueId() {
		return uniqueId;
	}

	public void setUniqueId(String uniqueId) {
		this.uniqueId = uniqueId;
	}

	public String getEncryptedUUID() {
		return encryptedUUID;
	}

	public void setEncryptedUUID(String encryptedUUID) {
		this.encryptedUUID = encryptedUUID;
	}
	
	public String getResult() {
		return result;
	}

	public void setResult(String result) {
		this.result = result;
	}

	public int getStatusCode() {
		return statusCode;
	}

	public void setStatusCode(int statusCode) {
		this.statusCode = statusCode;
	}

	public String getStoreId() {
		return storeId;
	}

	public void setStoreId(String storeId) {
		this.storeId = storeId;
	}

	public boolean isLoggedIn() {
		return isLoggedIn;
	}

	public void setLoggedIn(boolean isLoggedIn) {
		this.isLoggedIn = isLoggedIn;
	}

	public boolean isHeaderUser() {
		return isHeaderUser;
	}

	public void setHeaderUser(boolean isHeaderUser) {
		this.isHeaderUser = isHeaderUser;
	}
	public String getEncryptedMsisdn() {
		return encryptedMsisdn;
	}

	public void setEncryptedMsisdn(String encryptedMsisdn) {
		this.encryptedMsisdn = encryptedMsisdn;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

}
