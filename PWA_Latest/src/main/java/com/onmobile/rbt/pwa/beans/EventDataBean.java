package com.onmobile.rbt.pwa.beans;

public class EventDataBean {

	private String operator;
	private String circle;
	private String subscription_type;
	private String store_id;
	private String subscription_status;
	private String language;
	private String provider_id;
	private String provider_type;
	
	
	public String getOperator() {
		return operator;
	}

	public void setOperator(String operator) {
		this.operator = operator;
	}

	public String getCircle() {
		return circle;
	}

	public void setCircle(String circle) {
		this.circle = circle;
	}
	
	public String getSubscriptionType() {
		return subscription_type;
	}

	public void setSubscriptionType(String subscription_type) {
		this.subscription_type = subscription_type;
	}

	public String getStoreId() {
		return store_id;
	}

	public void setStoreId(String store_id) {
		this.store_id = store_id;
	}

	public String getSubscriptionStatus() {
		return subscription_status;
	}

	public void setSubscriptionStatus(String subscription_status) {
		this.subscription_status = subscription_status;
	}

	public String getLanguage() {
		return language;
	}

	public void setLanguage(String language) {
		this.language = language;
	}

	public String getProviderId() {
		return provider_id;
	}

	public void setProviderId(String provider_id) {
		this.provider_id = provider_id;
	}
	
	public String getProviderType() {
		return provider_type;
	}

	public void setProviderType(String provider_type) {
		this.provider_type = provider_type;
	}
}