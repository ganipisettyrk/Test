package com.onmobile.rbt.pwa.services.test;

import static org.junit.Assert.*;

import org.junit.Test;
import org.json.JSONObject;

public class AuthenticationServiceTest {

	@Test
	public void testGenerateOTP() {
		JSONObject jsonObj = new JSONObject();
		json.put("result", "otp_generated");
		json.put("statusCode", 200);
		
		assertEquals("", jsonObj);
	}

	@Test
	public void testValidateOTP() {
		fail("Not yet implemented");
	}

	@Test
	public void testIsUserLoggedIn() {
		fail("Not yet implemented");
	}

	@Test
	public void testUpdateMsisdn() {
		fail("Not yet implemented");
	}

	@Test
	public void testGetDecryptedMsisdnForOoredo() {
		fail("Not yet implemented");
	}

	@Test
	public void testGetEncryptedDataForContest() {
		fail("Not yet implemented");
	}

	@Test
	public void testGetDecryptedDataForContest() {
		fail("Not yet implemented");
	}

	@Test
	public void testPostPwaLaunch() {
		fail("Not yet implemented");
	}

	@Test
	public void testGetOperatorUserDetails() {
		fail("Not yet implemented");
	}

}
