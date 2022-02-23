package com.onmobile.rbt.pwa.beans;

public class NotificationsSubscription {

	private String notification_mode;
	private String provider_name;
	private String provider_id;
	private boolean enabled;

	public String getNotification_mode() {
		return notification_mode;
	}

	public void setNotification_mode(String notification_mode) {
		this.notification_mode = notification_mode;
	}

	public String getProvider_name() {
		return provider_name;
	}

	public void setProvider_name(String provider_name) {
		this.provider_name = provider_name;
	}

	public String getProvider_id() {
		return provider_id;
	}

	public void setProvider_id(String provider_id) {
		this.provider_id = provider_id;
	}

	public boolean isEnabled() {
		return enabled;
	}

	public void setEnabled(boolean enabled) {
		this.enabled = enabled;
	}

}
