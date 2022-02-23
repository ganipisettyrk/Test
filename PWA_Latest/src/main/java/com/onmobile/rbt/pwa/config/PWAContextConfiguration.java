package com.onmobile.rbt.pwa.config;

import java.io.IOException;
import java.net.MalformedURLException;
import java.util.HashSet;
import java.util.Locale;
import java.util.Properties;
import java.util.Set;
import java.util.List;


import javax.servlet.DispatcherType;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ReloadableResourceBundleMessageSource;
import org.springframework.core.Ordered;
import org.springframework.core.env.Environment;
import org.springframework.core.io.UrlResource;
import org.springframework.core.io.support.EncodedResource;
import org.springframework.core.io.support.PropertiesLoaderUtils;
import org.springframework.mobile.device.DeviceHandlerMethodArgumentResolver;
import org.springframework.mobile.device.DeviceResolverHandlerInterceptor;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.i18n.CookieLocaleResolver;
import org.springframework.web.servlet.i18n.LocaleChangeInterceptor;
import org.tuckey.web.filters.urlrewrite.UrlRewriteFilter;

import com.onmobile.rbt.pwa.utils.ApplicationResourceImpl;
import com.onmobile.rbt.pwa.utils.ApplicationResourceInterface;
import com.onmobile.rbt.pwa.utils.VoltronInterface;
import com.onmobile.rbt.pwa.utils.VoltronInterfaceImpl;
import com.onmobile.rbt.pwa.utils.WebUtilsImpl;
import com.onmobile.rbt.pwa.utils.WebUtilsInterface;

@Configuration
@EnableCaching
public class PWAContextConfiguration implements WebMvcConfigurer {
	private static final Logger logger = LogManager.getLogger(PWAContextConfiguration.class);

	@Autowired
	private Environment env;

	/*
Needed for HTTPS
	@Bean
	public ServletWebServerFactory servletContainer() {
		TomcatServletWebServerFactory tomcat = new TomcatServletWebServerFactory() {
			@Override
			protected void postProcessContext(Context context) {
				SecurityConstraint securityConstraint = new SecurityConstraint();
				securityConstraint.setUserConstraint("CONFIDENTIAL");
				SecurityCollection collection = new SecurityCollection();
				collection.addPattern("/*");
				securityConstraint.addCollection(collection);
				context.addConstraint(securityConstraint);
			}
		};
		tomcat.addAdditionalTomcatConnectors(redirectConnector());
		return tomcat;
	}

	private Connector redirectConnector() {
		Connector connector = new Connector("org.apache.coyote.http11.Http11NioProtocol");
		connector.setScheme("http");
		connector.setPort(8080);
		connector.setSecure(false);
		connector.setRedirectPort(8443);
		return connector;
	}
	*/

	@Bean(name = "messageResourceBean")
	public MessageSource messageSource() {
		ReloadableResourceBundleMessageSource messageSource = new ReloadableResourceBundleMessageSource();

		String baseNameStr = env.getProperty("spring.messages.basename");
		logger.info("baseNameStr" + baseNameStr);
		if (null != baseNameStr) {
			String[] baseNameArr = baseNameStr.split(",");
			messageSource.setBasenames(baseNameArr);
		}

		messageSource.setDefaultEncoding("UTF-8");
		messageSource.setCacheSeconds(10);

		return messageSource;
	}

	@Bean
	public Set<String> defaultMessagesKeys() throws MalformedURLException, IOException {

		Set<String> keySet = new HashSet<String>();
		String baseNameStr = env.getProperty("spring.messages.basename");
		if (null != baseNameStr) {
			String[] baseNameArr = baseNameStr.split(",");

			for (String str : baseNameArr) {
				String filePath = str + ".properties";
				Properties properties = PropertiesLoaderUtils
						.loadProperties(new EncodedResource(new UrlResource(filePath)));

				buildKeySet(keySet, properties);
			}

		}

		return keySet;
	}

	private static Set<String> buildKeySet(Set<String> keySet, Properties properties) {

		if (properties != null) {
			keySet.addAll(properties.stringPropertyNames());

		}
		return keySet;
	}

	@Bean
	public LocaleResolver localeResolver() {
		CookieLocaleResolver resolver = new CookieLocaleResolver();
		resolver.setDefaultLocale(Locale.ENGLISH);
		return resolver;
	}

	@Override
	public void addInterceptors(InterceptorRegistry registry) {
		registry.addInterceptor(localeChangeInterceptor()).addPathPatterns("/**");
	    registry.addInterceptor(deviceResolverHandlerInterceptor());
		registry.addInterceptor(httpRequestInterceptor());

	}

	@Bean
	public CustomHttpRequestInterceptor httpRequestInterceptor() {
		String maxUrlLen = env.getProperty("spring.max.url.param.length");
	    return new CustomHttpRequestInterceptor(maxUrlLen);
	}

	@Bean
	public LocaleChangeInterceptor localeChangeInterceptor() {
		LocaleChangeInterceptor lci = new LocaleChangeInterceptor();
		lci.setParamName("lang");
		return lci;
	}

	@Bean
	public FilterRegistrationBean<UrlRewriteFilter> wsdlUrlRewriteFilterRegisteration() {
		FilterRegistrationBean<UrlRewriteFilter> filterReg = new FilterRegistrationBean<UrlRewriteFilter>();
		filterReg.setFilter(new WsdlUrlRewriteFilter("urlrewrite.xml"));
		filterReg.addUrlPatterns("/*");
		filterReg.setName("UrlRewriteFilter");
		filterReg.setOrder(Ordered.HIGHEST_PRECEDENCE);
		filterReg.setDispatcherTypes(DispatcherType.REQUEST, DispatcherType.FORWARD);
		return filterReg;
	}
	
	@Bean
	public DeviceResolverHandlerInterceptor 
	        deviceResolverHandlerInterceptor() {
	    return new DeviceResolverHandlerInterceptor();
	}

	@Bean
	public DeviceHandlerMethodArgumentResolver 
	        deviceHandlerMethodArgumentResolver() {
	    return new DeviceHandlerMethodArgumentResolver();
	}

	@Override
	public void addArgumentResolvers(
	        List<HandlerMethodArgumentResolver> argumentResolvers) {
	    argumentResolvers.add(deviceHandlerMethodArgumentResolver());
	}

	@Bean
	public ApplicationResourceInterface applicationResource() {
		return new ApplicationResourceImpl();
	}

	@Bean
	public WebUtilsInterface webUtils() {
		return new WebUtilsImpl();
	}

	@Bean
	public VoltronInterface voltronInterface() {
		return new VoltronInterfaceImpl();
	}
}
