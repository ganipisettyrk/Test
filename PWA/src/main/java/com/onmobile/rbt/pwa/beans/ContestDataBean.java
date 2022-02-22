package com.onmobile.rbt.pwa.beans;

public class ContestDataBean {
    //  { "utm_source": "vfct_app", "msisdn" : "<user msisdn>",  "user_rbtstatus" : "<user status>",   "platform": "<android/ios/pwa>" }
    
    private String utm_source;
    private String msisdn;
    private String user_rbtstatus;
    private String platform;
    
    public ContestDataBean() {
	super();
    }
    
    public String getUtm_source() {
        return utm_source;
    }
    
    public void setUtm_source(String utm_source) {
        this.utm_source = utm_source;
    }
    
    public String getMsisdn() {
        return msisdn;
    }
    
    public void setMsisdn(String msisdn) {
        this.msisdn = msisdn;
    }
    
    public String getUser_rbtstatus() {
        return user_rbtstatus;
    }
    
    public void setUser_rbtstatus(String user_rbtstatus) {
        this.user_rbtstatus = user_rbtstatus;
    }
    
    public String getPlatform() {
        return platform;
    }
    
    public void setPlatform(String platform) {
        this.platform = platform;
    }

    @Override
    public String toString() {
	return "RbtAuthDataModel [utm_source=" + utm_source + ", msisdn=" + msisdn + ", user_rbtstatus="
		+ user_rbtstatus + ", platform=" + platform + "]";
    }
    
}

