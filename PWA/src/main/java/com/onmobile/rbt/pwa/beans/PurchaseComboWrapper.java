package com.onmobile.rbt.pwa.beans;

import java.io.Serializable;

import com.onmobile.store.storefront.dto.payment.Purchase;
import com.onmobile.store.storefront.dto.rbt.Asset;
import com.onmobile.store.storefront.dto.rbt.ThirdPartyConsent;
import com.onmobile.store.storefront.dto.user.Subscription;

public class PurchaseComboWrapper implements Serializable {
	private static final long serialVersionUID = 304936329723326400L;
	protected PlayRuleWrapper playrule;
	protected Asset asset;
	protected Subscription subscription;
	protected Purchase purchase;
	protected ThirdPartyConsent thirdpartyconsent;

	public PlayRuleWrapper getPlayrule() {
		return this.playrule;
	}

	public void setPlayrule(PlayRuleWrapper playrule) {
		this.playrule = playrule;
	}

	public Asset getAsset() {
		return this.asset;
	}

	public void setAsset(Asset asset) {
		this.asset = asset;
	}

	public Subscription getSubscription() {
		return this.subscription;
	}

	public void setSubscription(Subscription subscription) {
		this.subscription = subscription;
	}

	public Purchase getPurchase() {
		return this.purchase;
	}

	public void setPurchase(Purchase purchase) {
		this.purchase = purchase;
	}

	public ThirdPartyConsent getThirdpartyconsent() {
		return this.thirdpartyconsent;
	}

	public void setThirdpartyconsent(ThirdPartyConsent thirdpartyconsent) {
		this.thirdpartyconsent = thirdpartyconsent;
	}

	public int hashCode() {
		int result = 1;
		result = 31 * result + ((this.asset == null) ? 0 : this.asset.hashCode());
		result = 31 * result + ((this.playrule == null) ? 0 : this.playrule.hashCode());
		result = 31 * result + ((this.purchase == null) ? 0 : this.purchase.hashCode());
		result = 31 * result + ((this.subscription == null) ? 0 : this.subscription.hashCode());
		result = 31 * result + ((this.thirdpartyconsent == null) ? 0 : this.thirdpartyconsent.hashCode());
		return result;
	}

	public boolean equals(Object obj) {
		if (this == obj) {
			return true;
		}
		if (obj == null) {
			return false;
		}
		if (super.getClass() != obj.getClass()) {
			return false;
		}
		PurchaseComboWrapper other = (PurchaseComboWrapper) obj;
		if (this.asset == null) {
			if (other.asset != null)
				return false;
		} else if (!(this.asset.equals(other.asset))) {
			return false;
		}
		if (this.playrule == null) {
			if (other.playrule != null)
				return false;
		} else if (!(this.playrule.equals(other.playrule))) {
			return false;
		}
		if (this.purchase == null) {
			if (other.purchase != null)
				return false;
		} else if (!(this.purchase.equals(other.purchase))) {
			return false;
		}
		if (this.subscription == null) {
			if (other.subscription != null)
				return false;
		} else if (!(this.subscription.equals(other.subscription))) {
			return false;
		}
		if (this.thirdpartyconsent == null) {
			if (other.thirdpartyconsent != null)
				return false;
		} else if (!(this.thirdpartyconsent.equals(other.thirdpartyconsent))) {
			return false;
		}
		return true;
	}
}
