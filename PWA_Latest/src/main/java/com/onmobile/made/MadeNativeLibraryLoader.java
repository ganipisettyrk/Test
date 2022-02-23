package com.onmobile.made;

import org.apache.commons.lang3.SystemUtils;

public class MadeNativeLibraryLoader {

	public static void loadLibrary() {
		if (SystemUtils.IS_OS_UNIX) {
			System.out.println("MADEURL" + System.getProperty("sun.arch.data.model"));
			System.loadLibrary("MADEURL" + System.getProperty("sun.arch.data.model"));
		}
	}

}
