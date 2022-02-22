package com.onmobile.rbt.pwaseo.bean;

public class ChartItemBean {

	String id;
	String type;
	String trackName;
	String primaryArtistName;
	String albumName;
	String[] keywords;

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getTrackName() {
		return trackName;
	}

	public void setTrackName(String trackName) {
		this.trackName = trackName;
	}

	public String getPrimaryArtistName() {
		return primaryArtistName;
	}

	public void setPrimaryArtistName(String primaryArtistName) {
		this.primaryArtistName = primaryArtistName;
	}

	public String getAlbumName() {
		return albumName;
	}

	public void setAlbumName(String albumName) {
		this.albumName = albumName;
	}

	public String[] getKeywords() {
		return keywords;
	}

	public void setKeywords(String[] keywords) {
		this.keywords = keywords;
	}

	@Override
	public boolean equals(Object obj) {
		if (obj == this) {
			return true;
		}
		if (null == obj || this.getClass() != obj.getClass()) {
			return false;
		}
		ChartItemBean cib = (ChartItemBean) obj;
		return this.id.equals(cib.id);
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * Integer.parseInt(this.id);
		return result;
	}

}
