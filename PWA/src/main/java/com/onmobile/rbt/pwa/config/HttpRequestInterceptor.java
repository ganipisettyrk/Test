package com.onmobile.rbt.pwa.config;

import java.util.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

@Component
public class HttpRequestInterceptor implements HandlerInterceptor {

   private static final Logger logger = LogManager.getLogger(HttpRequestInterceptor.class);
   private static String maxUrlLen = null;
   
   public HttpRequestInterceptor(String maxUrlLen) {
      this.maxUrlLen = maxUrlLen;
   }


   @Override
   public boolean preHandle (HttpServletRequest request, HttpServletResponse response,
    Object handler) throws Exception {
   
   Enumeration<String> parameterNames = request.getParameterNames();
   while (parameterNames.hasMoreElements()) {
   int length;
    if(this.maxUrlLen != null) {
      length = Integer.parseInt(this.maxUrlLen);
    } else {
      length = 40;
    }
    String key = (String) parameterNames.nextElement();
    String value = request.getParameter(key);

    if(value.length() > length || value.contains("script")) {
      return false;
    }
   }
   return true;
   }

   @Override
   public void postHandle (HttpServletRequest request, HttpServletResponse response, 
      Object handler, ModelAndView modelAndView) throws Exception {
      
   }

   @Override
   public void afterCompletion (HttpServletRequest request, HttpServletResponse response, 
   Object handler, Exception exception) throws Exception {
      
   }
}