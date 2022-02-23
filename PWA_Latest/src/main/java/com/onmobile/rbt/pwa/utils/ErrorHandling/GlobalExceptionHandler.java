package com.onmobile.rbt.pwa.utils.ErrorHandling;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;

@ControllerAdvice
public class GlobalExceptionHandler {

	private static final Logger logger = LogManager.getLogger(GlobalExceptionHandler.class);

	@ResponseBody
	@ExceptionHandler
	ResponseEntity<PWARuntimeException> handleConflict(Exception e) {
		logger.info("Global ExceptionHandler: handleConflict()..." + e);
		PWARuntimeException pwaRuntimeException = new PWARuntimeException("Bad Request", "Failure", 400);
		return new ResponseEntity<PWARuntimeException>(pwaRuntimeException, HttpStatus.BAD_REQUEST);
	}
}