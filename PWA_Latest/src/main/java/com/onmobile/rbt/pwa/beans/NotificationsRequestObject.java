package com.onmobile.rbt.pwa.beans;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class NotificationsRequestObject {

	private String language;
	private String user_id;
	private String external_user_id;
	private String application_version;
	private String application_identifier;
	private List<NotificationsSubscription> subscriptions = new ArrayList<NotificationsSubscription>();
	private List<NotificationsUserAttribute> user_attributes = new ArrayList<NotificationsUserAttribute>();
	private Map<String, String> affiliate = new HashMap<String, String>(0);
	
	public String getLanguage() {
		return language;
	}

	public void setLanguage(String language) {
		this.language = language;
	}

	public String getUser_id() {
		return user_id;
	}

	public void setUser_id(String user_id) {
		this.user_id = user_id;
	}
	
	public String getExternal_user_id() {
		return external_user_id;
	}

	public void setExternal_user_id(String external_user_id) {
		this.external_user_id = external_user_id;
	}

	public String getApplication_version() {
		return application_version;
	}

	public void setApplication_version(String application_version) {
		this.application_version = application_version;
	}

	public String getApplication_identifier() {
		return application_identifier;
	}

	public void setApplication_identifier(String application_identifier) {
		this.application_identifier = application_identifier;
	}

	public List<NotificationsSubscription> getSubscriptions() {
		return subscriptions;
	}

	public void setSubscriptions(List<NotificationsSubscription> subscriptions) {
		this.subscriptions = subscriptions;
	}

	public List<NotificationsUserAttribute> getUser_attributes() {
		return user_attributes;
	}

	public void setUser_attributes(List<NotificationsUserAttribute> user_attributes) {
		this.user_attributes = user_attributes;
	}

	public void addSubscription(NotificationsSubscription subscription) {
		this.subscriptions.add(subscription);
	}

	public void addUserAttribute(NotificationsUserAttribute userAttribute) {
		this.user_attributes.add(userAttribute);
	}

	public Map<String, String> getAffiliate() {
		return affiliate;
	}

	public void setAffiliate(Map<String, String> affiliate) {
		this.affiliate = affiliate;
	}

}