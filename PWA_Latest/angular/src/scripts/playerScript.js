var aud = null;

function toggleControls(streamUrl, stopBtnClass, previewElemId) {

  var restoreVar;
  if (streamUrl.indexOf("$$") != -1) {
    restoreVar = streamUrl;
    streamUrl = streamUrl.split("$$")[0];
  } else {
    restoreVar = streamUrl;
  }
  var previewPath = streamUrl;

  var playbtn = document.getElementById(previewElemId);

  var previousSongElement = document.getElementById("mediaPlayerPrevSong");

  if (!$(playbtn).hasClass(stopBtnClass)) {
    previousSongElement.value = restoreVar;

    removeStopCssForAllElements();
    $(playbtn).addClass(stopBtnClass);
    switchAudioSrc(previewPath);
  } else {
    if (aud && aud.currentTime) {
      aud.currentTime = 0;
      aud.pause();
    }
    $(playbtn).removeClass(stopBtnClass);
    triggerBannerPlayerStopEvent();
  }
}

function switchAudioSrc(srcUrl) {
  if (aud != null) {
    aud.pause();
  }

  aud = new Audio();
  AddListenersToAudio();
  aud.src = srcUrl;
  aud.load();
}

function AddListenersToAudio() {
  aud.addEventListener('ended', onEnded, false);
  aud.addEventListener('pause', onPause, false);
  aud.addEventListener("error", function (e) {

  });
  aud.addEventListener('loadeddata', playWhenReady, false);
}

function playWhenReady() {
  aud.play();
}

var onEnded = function () {
  aud.pause();
  this.currentTime = 0;
  $('div.play1a').removeClass('play1b');
  $('div.play2a').removeClass('play2b');
  $('div.play7a').removeClass('play7b');

  if ($('div.play3a').hasClass('play3b')) {
    $('div.play3a').removeClass('play3b');
    triggerBannerPlayerStopEvent();
  }

};

var onPause = function () {
  this.currentTime = 0;
};

function triggerBannerPlayerStopEvent() {
  window.dispatchEvent(new Event('bannerplayer-stop-event'));
}

function stopAudio() {

  if (aud != null) {
    aud.currentTime = parseInt(0.0);
    aud.pause();
  }
  removeStopCssForAllElements();

}


function removeStopCssForAllElements() {

  if ($('div.play1a').hasClass('play1b')) {
    $('div.play1a').removeClass('play1b');
  }
  if ($('div.play2a').hasClass('play2b')) {
    $('div.play2a').removeClass('play2b');
  }
  if ($('div.play3a').hasClass('play3b')) {
    $('div.play3a').removeClass('play3b');
  }
  if ($('div.play7a').hasClass('play7b')) {
    $('div.play7a').removeClass('play7b');
  }
}
