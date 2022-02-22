package com.onmobile.rbt.pwaseo.utils;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

import com.onmobile.rbt.pwaseo.bean.ChartBean;
import com.onmobile.rbt.pwaseo.bean.ChartItemBean;
import com.onmobile.rbt.pwaseo.bean.ChartResultBean;

public class ChartUtility {

	public static ChartResultBean getChartResult(String chartUrl, String chartId, int maxCount)
			throws StoreServerException {

		ChartResultBean chartResultBean = new ChartResultBean();
		System.out.println("chartId-" + chartId);

		Set<ChartItemBean> chartItemsSet = new HashSet<ChartItemBean>();
		Set<ChartBean> chartBeanSet = new HashSet<ChartBean>();
		Set<ChartBean> parentChartBeanSet = new HashSet<ChartBean>();

		int offset = 0;
		ChartBean chartBean = getChartItemsResult(chartUrl, chartId, offset, maxCount);

		if (null != chartBean) {
			Set<ChartItemBean> chartItemsSetResponse = new HashSet<>(Arrays.asList(chartBean.getItems()));
			String type = chartItemsSetResponse.iterator().next().getType();
			System.out.println("type - " + type);

			if (type.equals("ringback")) {
				chartBeanSet.add(chartBean);

				chartItemsSet = chartItemsSetResponse;
				offset += maxCount;
				int totalCount = chartBean.getTotalItemCount();
				while (totalCount > offset) {
					ChartBean chartBeanResult = getChartItemsResult(chartUrl, chartId, offset, maxCount);
					offset += maxCount;
					Set<ChartItemBean> chartItemsResult = new HashSet<>(Arrays.asList(chartBeanResult.getItems()));
					chartItemsSet.addAll(chartItemsResult);

				}
			} else if (type.equals("chart")) {
				parentChartBeanSet.add(chartBean);
				for (ChartItemBean chart : chartItemsSetResponse) {
					ChartResultBean chartResultBeanResult = getChartResult(chartUrl, chart.getId(), maxCount);
					Set<ChartItemBean> chartItemsResult = chartResultBeanResult.getChartItemsSet();
					Set<ChartBean> chartBeanSetResult = chartResultBeanResult.getChartBeanSet();
					Set<ChartBean> parentChartBeanSetResult = chartResultBeanResult.getParentChartBeanSet();

					chartItemsSet.addAll(chartItemsResult);
					chartBeanSet.addAll(chartBeanSetResult);
					parentChartBeanSet.addAll(parentChartBeanSetResult);

				}

			}
		}
		System.out.println(chartId + " - chartItemsSet Size - " + chartItemsSet.size());
		chartResultBean.setChartItemsSet(chartItemsSet);
		chartResultBean.setChartBeanSet(chartBeanSet);
		chartResultBean.setParentChartBeanSet(parentChartBeanSet);


		return chartResultBean;
	}

	private static ChartBean getChartItemsResult(String chartUrl, String chartId, int offset, int maxCount)
			throws StoreServerException {
		String resp = getChartItems(chartUrl, chartId, Integer.toString(offset), Integer.toString(maxCount));
		ChartBean chartBean = (ChartBean) Utility.fromStringToObject(resp, ChartBean.class);
		return chartBean;
	}

	private static String getChartItems(String chartUrl, String chartId, String offset, String maxItems)
			throws StoreServerException {
		String url = chartUrl + chartId + "?offset=" + offset + "&max=" + maxItems;
		String chartItems = Utility.hitVoltronAPI(url, Utility.REQUEST_GET, null, String.class);
		return chartItems;
	}
}
