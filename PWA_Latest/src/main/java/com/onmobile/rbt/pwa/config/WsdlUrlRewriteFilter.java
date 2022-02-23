package com.onmobile.rbt.pwa.config;

import java.io.IOException;

import javax.servlet.FilterConfig;
import javax.servlet.ServletException;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.tuckey.web.filters.urlrewrite.Conf;
import org.tuckey.web.filters.urlrewrite.UrlRewriteFilter;

public class WsdlUrlRewriteFilter extends UrlRewriteFilter {

	private Resource resource;

	public WsdlUrlRewriteFilter(String configClasspathLocation) {
		this.resource = new ClassPathResource(configClasspathLocation);
	}

	@Override
	protected void loadUrlRewriter(FilterConfig filterConfig) throws ServletException {
		try {
			Conf conf = new Conf(filterConfig.getServletContext(), resource.getInputStream(), resource.getFilename(),
					"");
			checkConf(conf);
		} catch (IOException ex) {
			throw new ServletException("Unable to load URL-rewrite configuration file from ", ex);
		}
	}
}
