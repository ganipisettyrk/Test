package com.onmobile.rbt.pwa.beans;

import java.io.Serializable;

import com.onmobile.store.storefront.dto.rbt.Asset;
import com.onmobile.store.storefront.dto.rbt.CallingParty;
import com.onmobile.store.storefront.dto.rbt.PlayRuleInfo;

public class PlayRuleWrapper implements Serializable {
	private static final long serialVersionUID = -2953441583333839133L;
	protected String id;
	protected Asset asset;
	protected ScheduleWrapperBean schedule;
	protected CallingParty callingparty;
	protected boolean reverse;
	protected String status;
	protected PlayRuleInfo playruleinfo;

	public PlayRuleWrapper() {
	}

	public PlayRuleWrapper(String Id, ScheduleWrapperBean schedule) {
		this.id = Id;
		this.schedule = schedule;
	}

	public String getId() {
		return this.id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public Asset getAsset() {
		return this.asset;
	}

	public void setAsset(Asset asset) {
		this.asset = asset;
	}

	public ScheduleWrapperBean getSchedule() {
		return this.schedule;
	}

	public void setSchedule(ScheduleWrapperBean schedule) {
		this.schedule = schedule;
	}

	public CallingParty getCallingparty() {
		return this.callingparty;
	}

	public void setCallingparty(CallingParty callingparty) {
		this.callingparty = callingparty;
	}

	public boolean isReverse() {
		return this.reverse;
	}

	public void setReverse(boolean reverse) {
		this.reverse = reverse;
	}

	public String getStatus() {
		return this.status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public PlayRuleInfo getPlayruleinfo() {
		return this.playruleinfo;
	}

	public void setPlayruleinfo(PlayRuleInfo playruleinfo) {
		this.playruleinfo = playruleinfo;
	}

	public int hashCode() {
		int result = 1;
		result = 31 * result + ((this.asset == null) ? 0 : this.asset.hashCode());
		result = 31 * result + ((this.callingparty == null) ? 0 : this.callingparty.hashCode());
		result = 31 * result + ((this.id == null) ? 0 : this.id.hashCode());
		result = 31 * result + ((this.playruleinfo == null) ? 0 : this.playruleinfo.hashCode());
		result = 31 * result + ((this.reverse) ? 1231 : 1237);
		result = 31 * result + ((this.schedule == null) ? 0 : this.schedule.hashCode());
		result = 31 * result + ((this.status == null) ? 0 : this.status.hashCode());
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
		PlayRuleWrapper other = (PlayRuleWrapper) obj;
		if (this.asset == null) {
			if (other.asset != null)
				return false;
		} else if (!(this.asset.equals(other.asset))) {
			return false;
		}
		if (this.callingparty == null) {
			if (other.callingparty != null)
				return false;
		} else if (!(this.callingparty.equals(other.callingparty))) {
			return false;
		}

		if (this.id == null) {
			if (other.id != null)
				return false;
		} else if (!(this.id.equals(other.id))) {
			return false;
		}
		if (this.playruleinfo == null) {
			if (other.playruleinfo != null)
				return false;
		} else if (!(this.playruleinfo.equals(other.playruleinfo))) {
			return false;
		}
		if (this.reverse != other.reverse) {
			return false;
		}
		if (this.schedule == null) {
			if (other.schedule != null)
				return false;
		} else if (!(this.schedule.equals(other.schedule))) {
			return false;
		}
		if (this.status == null) {
			if (other.status != null)
				return false;
		} else if (!(this.status.equals(other.status))) {
			return false;
		}
		return true;
	}
}
