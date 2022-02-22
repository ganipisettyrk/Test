package com.onmobile.rbt.pwaseo;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.Date;
import java.util.HashSet;
import java.util.Properties;
import java.util.Set;

import com.onmobile.rbt.pwaseo.bean.ChartBean;
import com.onmobile.rbt.pwaseo.bean.ChartItemBean;
import com.onmobile.rbt.pwaseo.bean.ChartResultBean;
import com.onmobile.rbt.pwaseo.utils.ChartUtility;
import com.onmobile.rbt.pwaseo.utils.StoreServerException;
import com.redfin.sitemapgenerator.ChangeFreq;
import com.redfin.sitemapgenerator.WebSitemapGenerator;
import com.redfin.sitemapgenerator.WebSitemapUrl;

public class PWASEOMain {

	public static void main(String[] args) throws StoreServerException, IOException {

		Set<ChartItemBean> contentSet = new HashSet<ChartItemBean>();
		Set<String> searchKeyWordSet = new HashSet<String>();
		Set<String> staticUrlSet = new HashSet<String>();
		Set<ChartBean> parentChartSet = new HashSet<ChartBean>();
		Set<ChartBean> chartSet = new HashSet<ChartBean>();

		Properties prop = new Properties();
		String propFileName = "config.properties";

		InputStream inputStream = PWASEOMain.class.getClassLoader().getResourceAsStream(propFileName);

		if (inputStream != null) {
			prop.load(inputStream);
		} else {
			throw new FileNotFoundException("property file '" + propFileName + "' not found in the classpath");
		}

		String chartIds = prop.getProperty("pwaseo.chart.ids");
		System.out.println("Configured chartIds - " + chartIds);
		String parentChartIds = prop.getProperty("pwaseo.parent.chart.ids");
		System.out.println("Configured parentChartIds - " + parentChartIds);
		String searchKeywords = prop.getProperty("pwaseo.search.keywords");
		System.out.println("Configured searchKeywords - " + searchKeywords);
		String staticUrls = prop.getProperty("pwaseo.static.urls");
		System.out.println("Configured staticUrl - " + staticUrls);

		String operatorName = prop.getProperty("pwaseo.operator.name");
		System.out.println("Configured operatorName - " + operatorName);

		String baseUrl = prop.getProperty("pwaseo.base.url");
		System.out.println("Configured baseUrl - " + baseUrl);

		String sitemapFile = prop.getProperty("pwaseo.sitemap.file.path");
		System.out.println("Configured sitemapFile - " + sitemapFile);

		String chartUrl = prop.getProperty("pwaseo.voltron.chart.url");
		System.out.println("Configured chartUrl - " + chartUrl);

		int maxCount = 50;

		if (null != parentChartIds) {
			String[] parentChartIdArr = parentChartIds.split(",");

			for (String chartId : parentChartIdArr) {
				chartId = chartId.trim();
				ChartResultBean chartResultBeanResult = ChartUtility.getChartResult(chartUrl, chartId, maxCount);
				Set<ChartItemBean> chartItemsResult = chartResultBeanResult.getChartItemsSet();
				Set<ChartBean> chartSetResult = chartResultBeanResult.getChartBeanSet();
				Set<ChartBean> parentChartSetResult = chartResultBeanResult.getParentChartBeanSet();

				if (null != chartItemsResult) {
					contentSet.addAll(chartItemsResult);
				}

				if (null != chartSetResult) {
					chartSet.addAll(chartSetResult);
				}

				if (null != parentChartSetResult) {
					parentChartSet.addAll(parentChartSetResult);
				}
			}
			System.out.println("contentSet Size - " + contentSet.size());

		}

		if (null != chartIds) {
			String[] chartIdArr = chartIds.split(",");
			for (String chartId : chartIdArr) {
				chartId = chartId.trim();
				ChartResultBean chartResultBeanResult = ChartUtility.getChartResult(chartUrl, chartId, maxCount);
				Set<ChartItemBean> chartItemsResult = chartResultBeanResult.getChartItemsSet();
				Set<ChartBean> chartSetResult = chartResultBeanResult.getChartBeanSet();
				Set<ChartBean> parentChartSetResult = chartResultBeanResult.getParentChartBeanSet();

				if (null != chartItemsResult) {
					contentSet.addAll(chartItemsResult);
				}

				if (null != chartSetResult) {
					chartSet.addAll(chartSetResult);
				}

				if (null != parentChartSetResult) {
					parentChartSet.addAll(parentChartSetResult);
				}

			}
			System.out.println("contentSet Size - " + contentSet.size());
		}

		if (null != searchKeywords) {
			String[] searchKeywordsdArr = searchKeywords.split(",");
			searchKeyWordSet = new HashSet<>(Arrays.asList(searchKeywordsdArr));
			System.out.println("searchKeyWordSet Size - " + searchKeyWordSet.size());

		}

		if (null != staticUrls) {
			String[] staticUrlsArr = staticUrls.split(",");
			staticUrlSet = new HashSet<>(Arrays.asList(staticUrlsArr));
			System.out.println("staticUrlSet Size - " + staticUrlSet.size());

		}

		WebSitemapGenerator webSitemapGenerator = WebSitemapGenerator.builder(baseUrl, new File(sitemapFile)).build();

		WebSitemapUrl webSitemapUrl = new WebSitemapUrl.Options(baseUrl).lastMod(new Date()).priority(1.0)
				.changeFreq(ChangeFreq.HOURLY).build();
		webSitemapGenerator.addUrl(webSitemapUrl);
		int count = 0;

		if (!contentSet.isEmpty()) {

			for (ChartItemBean item : contentSet) {
				if (count < 50000) {
					count++;
					String url = baseUrl + "content/" + item.getId() + "/" + item.getType() + "/ / /"
							+ item.getTrackName() + "/" + item.getAlbumName() + "/" + item.getPrimaryArtistName() + "/"
							+ operatorName;
					url = removeSpecialCharacter(url);
					webSitemapGenerator.addUrl(url);

				}
			}
		}

		if (!searchKeyWordSet.isEmpty()) {
			for (String keyword : searchKeyWordSet) {
				if (count < 50000) {
					count++;
					String url = baseUrl + "search/" + keyword.trim();
					url = removeSpecialCharacter(url);
					webSitemapGenerator.addUrl(url);
				}
			}
		}

		if (!staticUrlSet.isEmpty()) {
			for (String urlStr : staticUrlSet) {
				if (count < 50000) {
					count++;
					String url = baseUrl + urlStr.trim();
					url = removeSpecialCharacter(url);
					webSitemapGenerator.addUrl(url);
				}
			}
		}

		if (!parentChartSet.isEmpty()) {
			for (ChartBean chart : parentChartSet) {
				if (count < 50000) {
					count++;
					String url = baseUrl + "more/charts/" + chart.getId() + "/" + chart.getChartName() + "/"
							+ operatorName;
					url = removeSpecialCharacter(url);
					webSitemapGenerator.addUrl(url);
				}
			}
		}

		if (!chartSet.isEmpty()) {
			for (ChartBean chart : chartSet) {
				if (count < 50000) {
					count++;
					String url = baseUrl + "more/chartcontent/" + chart.getId() + "/" + chart.getChartName() + "/"
							+ operatorName;
					url = removeSpecialCharacter(url);
					webSitemapGenerator.addUrl(url);
				}
			}
		}
		webSitemapGenerator.write();

	}

	private static String removeSpecialCharacter(String url) {

		if (null != url) {
			url = url.replace("(", "");
			url = url.replace(")", "");
		}
		return url;

	}

}
