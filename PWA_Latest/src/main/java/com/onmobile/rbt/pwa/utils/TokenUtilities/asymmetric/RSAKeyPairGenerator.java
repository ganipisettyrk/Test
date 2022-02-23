package com.onmobile.rbt.pwa.utils.TokenUtilities.asymmetric;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.PublicKey;

public final class RSAKeyPairGenerator {

	private PrivateKey privateKey;
	private PublicKey publicKey;

	public RSAKeyPairGenerator() throws NoSuchAlgorithmException {
		KeyPairGenerator rsaKeyGen = KeyPairGenerator.getInstance(RSA.KEY_AGREEMENT_ALGORITHM_NAME);
		rsaKeyGen.initialize(RSA.RSA_KEY_LENGTH);
		KeyPair rsaKeyPair = rsaKeyGen.generateKeyPair();
		this.privateKey = rsaKeyPair.getPrivate();
		this.publicKey = rsaKeyPair.getPublic();
	}

	public void writeToFile(String path, byte[] key) throws IOException {
		File f = new File(path);
		f.getParentFile().mkdirs();
		FileOutputStream fos = null;
		try{
			fos = new FileOutputStream(f);
			fos.write(key);
			fos.flush();
			fos.close();
		}
		catch(Exception ex) {
			
		}
		finally {
			if(null != fos) {
				fos.close();
			}
		}
		
	}

	public PrivateKey getPrivateKey() {
		return privateKey;
	}

	public PublicKey getPublicKey() {
		return publicKey;
	}

}
