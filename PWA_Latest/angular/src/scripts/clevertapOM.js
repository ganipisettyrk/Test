function initializeClevertapFromScript(accountId) {
    window.clevertap = { event: [], profile: [], account: [], onUserLogin: [], notifications: [] };
    window.clevertap.account.push({ 'id': accountId });
    (function () {
        var wzrk = document.createElement('script');
        wzrk.type = 'text/javascript';
        wzrk.async = true;
        wzrk.src = ('https:' == document.location.protocol ? 'https://d2r1yp2w7bby2u.cloudfront.net' : 'http://static.clevertap.com') + '/js/a.js';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(wzrk, s);
    })();
}

function updateEvent(eventName, data) {
    if (window && window.clevertap && window.clevertap.event) {
        if (data) {
            window.clevertap.event.push(eventName, data);
        } else {
            window.clevertap.event.push(eventName);
        }
    }
}

function updateProfile(userData) {
    if (window && window.clevertap && window.clevertap.profile) {
        window.clevertap.profile.push({ "Site": userData });
    }
}

function getCleverTapID() {
    if (window && window.clevertap && window.clevertap.getCleverTapID) {
        let ctUserId = window.clevertap.getCleverTapID();
        localStorage.setItem('CT_USER_ID', ctUserId);
        return ctUserId;
    }
}

function pushCTNotifications(contextPath, titleText, bodyText, okBtnText, rejectBtnText, okBtnColor, askAgainTime) {
    if (window && window.clevertap) {
        window.clevertap.notifications.push({
            "titleText": titleText,
            "bodyText": bodyText,
            "okButtonText": okBtnText,
            "rejectButtonText": rejectBtnText,
            "okButtonColor": okBtnColor,
            "askAgainTimeInSeconds": askAgainTime,
            "serviceWorkerPath": contextPath + "clevertap_sw.js" // path to your custom service worker file
        });
    }
}

function pushCTNotificationsForGDPR(contextPath){
    if (window && window.clevertap) {
        window.clevertap.notifications.push({
            "skipDialog":true,
            "serviceWorkerPath": contextPath + "clevertap_sw.js"
        });
    }
}

/*window.clevertap.notificationCallback = function(msg) {
    //raise the notification viewed and clicked events in the callback
    window.clevertap.raiseNotificationViewed();
    console.log(JSON.stringify(msg));//your custom rendering implementation here
    var $button = jQuery("<button></button>");//element on whose click you want to raise the notification clicked event
    $button.click(function(){
        window.clevertap.raiseNotificationClicked();
    });
}*/
