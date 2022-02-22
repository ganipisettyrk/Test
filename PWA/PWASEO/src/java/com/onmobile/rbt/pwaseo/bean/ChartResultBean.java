package com.onmobile.rbt.pwaseo.bean;

import java.util.Set;

public class ChartResultBean {

	Set<ChartItemBean> chartItemsSet;
	Set<ChartBean> chartBeanSet;
	Set<ChartBean> parentChartBeanSet;


	public Set<ChartItemBean> getChartItemsSet() {
		return chartItemsSet;
	}

	public void setChartItemsSet(Set<ChartItemBean> chartItemsSet) {
		this.chartItemsSet = chartItemsSet;
	}

	public Set<ChartBean> getChartBeanSet() {
		return chartBeanSet;
	}

	public void setChartBeanSet(Set<ChartBean> chartBeanSet) {
		this.chartBeanSet = chartBeanSet;
	}

	public Set<ChartBean> getParentChartBeanSet() {
		return parentChartBeanSet;
	}

	public void setParentChartBeanSet(Set<ChartBean> parentChartBeanSet) {
		this.parentChartBeanSet = parentChartBeanSet;
	}
		
}
