package com.onmobile.rbt.pwa.beans;

public class PwaLaunchBean {

	private String user_id;
	private String msisdn;
	private String source;
	private String type;
	private String event_name;
	private EventDataBean event_data = new EventDataBean();
	
	
	
	public String getUserid() {
		return user_id;
	}

	public void setUserId(String user_id) {
		this.user_id = user_id;
	}

	public String getMsisdn() {
		return msisdn;
	}

	public void setMsisdn(String msisdn) {
		this.msisdn = msisdn;
	}
	
	public String getSource() {
		return source;
	}

	public void setSource(String source) {
		this.source= source;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type= type;
	}

	public String getEventName() {
		return event_name;
	}

	public void setEventName(String event_name) {
		this.event_name = event_name;
	}

	public EventDataBean getEventData() {
		return event_data;
	}

	public void setEventData(EventDataBean event_data) {
		this.event_data = event_data;
	}

	
}