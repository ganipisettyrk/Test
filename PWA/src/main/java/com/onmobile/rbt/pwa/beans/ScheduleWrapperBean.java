package com.onmobile.rbt.pwa.beans;

import java.io.Serializable;

public class ScheduleWrapperBean implements Serializable {
	private static final long serialVersionUID = 6062823087523015220L;
	protected ScheduleType type;
	protected long id;
	protected String description;
	protected String play_duration;
	protected DateRangeWrapper date_range;
	protected TimeRangeWrapper time_range;

	public ScheduleWrapperBean() {
	}

	public ScheduleWrapperBean(long Id) {
		this.id = Id;
	}

	public ScheduleWrapperBean(ScheduleType type, String description) {
		this.type = type;
		this.description = description;
	}

	public ScheduleWrapperBean(ScheduleType type, String description, String playDuration, DateRangeWrapper dateRange,
			TimeRangeWrapper timeRange) {
		this.type = type;
		this.description = description;
		this.play_duration = playDuration;
		this.date_range = dateRange;
		this.time_range = timeRange;
	}

	public String getDescription() {
		return this.description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public ScheduleType getType() {
		return this.type;
	}

	public void setType(ScheduleType type) {
		this.type = type;
	}

	public long getId() {
		return this.id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public String getPlayDuration() {
		return this.play_duration;
	}

	public void setPlayDuration(String playedDuration) {
		this.play_duration = playedDuration;
	}

	public DateRangeWrapper getDateRange() {
		return this.date_range;
	}

	public void setDateRange(DateRangeWrapper dateRange) {
		this.date_range = dateRange;
	}

	public TimeRangeWrapper getTimeRange() {
		return this.time_range;
	}

	public void setTimeRange(TimeRangeWrapper timeRange) {
		this.time_range = timeRange;
	}

	public int hashCode() {
		int result = 1;
		result = 31 * result + ((this.description == null) ? 0 : this.description.hashCode());
		result = 31 * result + (int) (this.id ^ this.id >>> 32);
		result = 31 * result + ((this.type == null) ? 0 : this.type.hashCode());
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
		ScheduleWrapperBean other = (ScheduleWrapperBean) obj;
		if (this.description == null) {
			if (other.description != null)
				return false;
		} else if (!(this.description.equals(other.description))) {
			return false;
		}
		if (this.id != other.id) {
			return false;
		}

		return (this.type == other.type);
	}

	public static enum ScheduleType {
		DATETIMECONTINUOUSRANGE, DATERANGE, SEGMENTOFDAY, DEFAULT, DAYOFMONTH, DAYOFWEEK, DATETIMERANGE, PLAYRANGE;
	}
}
