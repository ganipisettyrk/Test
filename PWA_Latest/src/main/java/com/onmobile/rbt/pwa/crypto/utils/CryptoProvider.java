package com.onmobile.rbt.pwa.crypto.utils;

/**
 * This interface provides encryption/decryption contract.
 */
public interface CryptoProvider {

	String encrypt(String... args);

	String decrypt(String input);
}
