package com.onmobile.rbt.pwa.utils.TokenUtilities.bean;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonInclude(value = Include.NON_NULL)
public class CryptoPayloadDto {

	@JsonProperty("msisdn")
	private String msisdn;
	@JsonProperty("pin")
	private String encryptedPin;

	private String aesKey;
	private String hmacKey;
	private String uuid;

	@JsonProperty("crypto_exchange")
	private CryptoExchangeDto crypto_exchange;

	public String getMsisdn() {
		return msisdn;
	}

	public void setMsisdn(String msisdn) {
		this.msisdn = msisdn;
	}

	public String getEncryptedPin() {
		return encryptedPin;
	}

	public void setEncryptedPin(String encryptedPin) {
		this.encryptedPin = encryptedPin;
	}

	public CryptoExchangeDto getCrypto_exchange() {
		return crypto_exchange;
	}

	public void setCrypto_exchange(CryptoExchangeDto crypto_exchange) {
		this.crypto_exchange = crypto_exchange;
	}

	public String getAesKey() {
		return aesKey;
	}

	public void setAesKey(String aesKey) {
		this.aesKey = aesKey;
	}

	public String getHmacKey() {
		return hmacKey;
	}

	public void setHmacKey(String hmacKey) {
		this.hmacKey = hmacKey;
	}

	public String getUuid() {
		return uuid;
	}

	public void setUuid(String uuid) {
		this.uuid = uuid;
	}
	
}
