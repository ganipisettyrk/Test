package com.onmobile.rbt.pwa.beans;

import java.util.List;

public class ExceptionBean {

	private String code;
	private String sub_code;
	private String summary;
	private String description;
	private List<CatalogErrorBean> errors;

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public String getSub_code() {
		return sub_code;
	}

	public void setSub_code(String sub_code) {
		this.sub_code = sub_code;
	}

	public String getSummary() {
		return summary;
	}

	public void setSummary(String summary) {
		this.summary = summary;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}
	
	public List<CatalogErrorBean> getErrors() {
		return errors;
	}

	public void setErrors(List<CatalogErrorBean> errors) {
		this.errors = errors;
	}

}
