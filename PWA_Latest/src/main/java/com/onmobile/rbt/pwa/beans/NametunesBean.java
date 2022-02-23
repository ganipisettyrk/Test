package com.onmobile.rbt.pwa.beans;

public class NametunesBean {

	private String text;
	private String language;
	private String celebrity;
	private String item_subtype;

	public NametunesBean(String text, String language, String item_subtype) {
		super();
		this.text = text;
		this.language = language;
		this.celebrity = "NA";
		this.item_subtype = item_subtype;
	}

	public String getText() {
		return text;
	}

	public void setText(String text) {
		this.text = text;
	}

	public String getLanguage() {
		return language;
	}

	public void setLanguage(String language) {
		this.language = language;
	}

	public String getCelebrity() {
		return celebrity;
	}

	public void setCelebrity(String celebrity) {
		this.celebrity = celebrity;
	}

	public String getItemSubtype() {
		return item_subtype;
	}

	public void setItemSubtype(String item_subtype) {
		this.item_subtype = item_subtype;
	}

}
