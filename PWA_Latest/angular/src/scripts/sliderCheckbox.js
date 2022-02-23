function updateSpecialCallerFields() {
    var allCallerField = document.getElementById("f");
    var specialCallerField = document.getElementById("h");

    if (specialCallerField.checked) {
        allCallerField.checked = true;
        specialCallerField.checked = false;
        $('#splCaller').addClass('disable');
        $('#allCaller').removeClass('disable');
    } else {
        allCallerField.checked = false;
        specialCallerField.checked = true;
        $('#splCaller').removeClass('disable');
        $('#allCaller').addClass('disable');
    }

}

function updateAllCallerFields() {
    var allCallerField = document.getElementById("f");
    var specialCallerField = document.getElementById("h");

    if (allCallerField.checked) {

        allCallerField.checked = false;
        specialCallerField.checked = true;
        $('#splCaller').removeClass('disable');
        $('#allCaller').addClass('disable');

    } else {
        allCallerField.checked = true;
        specialCallerField.checked = false;
        $('#splCaller').addClass('disable');
        $('#allCaller').removeClass('disable');
    }

}

function toggleActivitySelectionSliderButton(index) {
    var sliderButton = document.getElementById("i" + index);
    if (sliderButton.checked) {
        sliderButton.checked = false;
    } else {
        sliderButton.checked = true;
    }
}

function toggleActivityHistorySliderButton(index) {
    var sliderButton = document.getElementById("h" + index);
    if (sliderButton.checked) {
        sliderButton.checked = false;
    } else {
        sliderButton.checked = true;
    }
}