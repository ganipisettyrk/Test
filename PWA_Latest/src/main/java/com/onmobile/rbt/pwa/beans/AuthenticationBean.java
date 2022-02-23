package com.onmobile.rbt.pwa.beans;

public class AuthenticationBean {

	private String msisdn;
	private String pin;

	public AuthenticationBean(String msisdn) {
		super();
		this.msisdn = msisdn;
	}

	public AuthenticationBean(String msisdn, String pin) {
		super();
		this.msisdn = msisdn;
		this.pin = pin;
	}

	public String getMsisdn() {
		return msisdn;
	}

	public void setMsisdn(String msisdn) {
		this.msisdn = msisdn;
	}

	public String getPin() {
		return pin;
	}

	public void setPin(String pin) {
		this.pin = pin;
	}

}
