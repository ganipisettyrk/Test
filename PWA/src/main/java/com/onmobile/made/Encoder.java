package com.onmobile.made;

import javax.annotation.PostConstruct;

public class Encoder {

	@PostConstruct
	public void postConstruct() {
		MadeNativeLibraryLoader.loadLibrary();
	}

	public static native synchronized String genCode(Object... args);

	public static native int getcodes(String sharedFilePath);

}

