package com.onmobile.rbt.pwa.beans;

import java.io.Serializable;
import java.util.Date;

public class DateRangeWrapper implements Serializable {
	private static final long serialVersionUID = -1809608823709777010L;
	protected Date start_date;
	protected Date end_date;

	public Date getStartDate() {
		return this.start_date;
	}

	public void setStartDate(Date startDate) {
		this.start_date = startDate;
	}

	public Date getEndDate() {
		return this.end_date;
	}

	public void setEndDate(Date endDate) {
		this.end_date = endDate;
	}
}
