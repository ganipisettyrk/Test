package com.onmobile.made;

import javax.annotation.PostConstruct;

public class Decoder {

	@PostConstruct
	public void postConstruct() {
		MadeNativeLibraryLoader.loadLibrary();
	}

	public static native synchronized String decodeString(String input);

	public static native int init(String sharedFilePath);

}