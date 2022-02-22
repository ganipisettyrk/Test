package com.onmobile.rbt.pwa.beans;

public class ContentLanguageBean {
	private String displayText;
	private String languageId;

	public ContentLanguageBean(String languageId, String displayText) {
		this.languageId = languageId;
		this.displayText = displayText;
	}

	public String getDisplayText() {
		return displayText;
	}

	public void setDisplayText(String displayText) {
		this.displayText = displayText;
	}

	public String getLanguageId() {
		return languageId;
	}

	public void setLanguageId(String languageId) {
		this.languageId = languageId;
	}

}
