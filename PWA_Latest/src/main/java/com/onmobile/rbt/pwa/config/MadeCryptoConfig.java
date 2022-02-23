package com.onmobile.rbt.pwa.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.DependsOn;

import com.onmobile.made.Decoder;
import com.onmobile.made.Encoder;
import com.onmobile.rbt.pwa.crypto.utils.CryptoProvider;
import com.onmobile.rbt.pwa.crypto.utils.MadeCryptoProviderImpl;

@Configuration
public class MadeCryptoConfig {
	
	@ConditionalOnProperty(prefix="pwa", name="rt.made.crypto.enabled")
	@Bean(name = "madeEncoder")
	public Encoder madeEncoder() {
		return new Encoder();
	}
	
	@ConditionalOnProperty(prefix="pwa", name="rt.made.crypto.enabled")
	@Bean(name = "madeDecoder")
	public Decoder madeDecoder() {
		return new Decoder();
	}

	@ConditionalOnProperty(prefix="pwa", name="rt.made.crypto.enabled")
	@DependsOn(value = { "madeEncoder", "madeDecoder" })
	@Bean(name = "madeCryptoProvider")
	public CryptoProvider madeCryptoProvider() {
		return new MadeCryptoProviderImpl();
	}

}
