function callWebOTP() {

  if (window.iswebotpallowed) {
    const input = document.querySelector('input[autocomplete="one-time-code"]');

    if (!input) return;
    const ac = new AbortController();
    window.addEventListener('otp-read', e => {
      ac.abort();
    }, {passive: true});

    navigator.credentials.get({
      otp: { transport: ['sms'] },
      signal: ac.signal
    }).then(otp => {
      var otpValueStr = otp.code;
      input.value = otpValueStr;
      window.dispatchEvent(new CustomEvent('otp-read', {
        detail: {
          otpValue: otpValueStr
        }
      }));
    }).catch(err => {
     // console.log(err);
    });
  }
}