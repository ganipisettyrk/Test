package com.onmobile.rbt.pwa.utils.TokenUtilities.bean;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonInclude(value = Include.NON_NULL)
public class CryptoExchangeDto implements java.io.Serializable {

	private static final long serialVersionUID = 5670569444228322598L;

	@JsonProperty("version")
	private String version;
	@JsonProperty("payload")
	private String payload;
	@JsonProperty("iv")
	private String iv;
	@JsonProperty("hmac")
	private String hmac;
	@JsonProperty("ctoken")
	private String ctoken;

	public String getVersion() {
		return version;
	}

	public void setVersion(String version) {
		this.version = version;
	}

	public String getPayload() {
		return payload;
	}

	public void setPayload(String payload) {
		this.payload = payload;
	}

	public String getIv() {
		return iv;
	}

	public void setIv(String iv) {
		this.iv = iv;
	}

	public String getHmac() {
		return hmac;
	}

	public void setHmac(String hmac) {
		this.hmac = hmac;
	}

	public String getCtoken() {
		return ctoken;
	}

	public void setCtoken(String ctoken) {
		this.ctoken = ctoken;
	}

}
