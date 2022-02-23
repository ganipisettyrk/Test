package com.onmobile.rbt.pwaseo.bean;

public class ChartBean {

	String id;
	String type;
	String chartName;
	int itemCount;
	int totalItemCount;
	ChartItemBean[] items;

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getChartName() {
		return chartName;
	}

	public void setChartName(String chartName) {
		this.chartName = chartName;
	}

	public int getItemCount() {
		return itemCount;
	}

	public void setItemCount(int itemCount) {
		this.itemCount = itemCount;
	}

	public int getTotalItemCount() {
		return totalItemCount;
	}

	public void setTotalItemCount(int totalItemCount) {
		this.totalItemCount = totalItemCount;
	}

	public ChartItemBean[] getItems() {
		return items;
	}

	public void setItems(ChartItemBean[] items) {
		this.items = items;
	}

	@Override
	public boolean equals(Object obj) {
		if (obj == this) {
			return true;
		}
		if (null == obj || this.getClass() != obj.getClass()) {
			return false;
		}
		ChartBean cb = (ChartBean) obj;
		return this.id.equals(cb.id);
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * Integer.parseInt(this.id);
		return result;
	}

}
