package com.onmobile.rbt.pwa.beans;

import java.io.Serializable;
import java.util.Date;

public class TimeRangeWrapper implements Serializable {
	private static final long serialVersionUID = -4114087607331478452L;
	protected Date from_time;
	protected Date to_time;

	public String toString() {
		return "TimeRange [fromTime=" + this.from_time + ", toTime=" + this.to_time + "]";
	}

	public Date getFromTime() {
		return this.from_time;
	}

	public void setFromTime(Date fromTime) {
		this.from_time = fromTime;
	}

	public Date getToTime() {
		return this.to_time;
	}

	public void setToTime(Date toTime) {
		this.to_time = toTime;
	}
}
