function InitSlider(sliderContainerId, MAX_WIDTH, autoPlayOption, sliderWidth, slideSpacing, slideIndex) {
	var jssorSliderOptions = {
		$AutoPlay: Number(autoPlayOption),
		$AutoPlaySteps: 1,
		$SlideDuration: 760,
		$FillMode: 2,
		$SlideWidth: Number(sliderWidth),
		$SlideSpacing: Number(slideSpacing),
		$StartIndex: Number(slideIndex),
		$ArrowNavigatorOptions: {
			$Class: $JssorArrowNavigator$,
			$Steps: 1
		},
		$BulletNavigatorOptions: {
			$Class: $JssorBulletNavigator$
		}
	};

	var jssorSlider = new $JssorSlider$(sliderContainerId, jssorSliderOptions);
	ScaleSlider(jssorSlider);

	function ScaleSlider(jssorSlider) {
		var containerWidth = document.body.clientWidth;
		if (containerWidth) {

			if (sliderContainerId == "sliderContainer1") {
				var expectedWidth = Math.min(Number(MAX_WIDTH) || containerWidth, containerWidth);

				if (containerWidth > 479) {
					jssorSlider.$ScaleWidth(expectedWidth);
				}
				else {
					var expectedheight = (expectedWidth * 370) / 600;
					jssorSlider.$ScaleSize(expectedWidth, expectedheight);
				}
			}
			else if (sliderContainerId == "sliderContainer2" || sliderContainerId == "sliderContainer5" || sliderContainerId == "sliderContainer8") {
				var expectedWidth = Math.min(containerWidth, 1000);
				if (containerWidth > 479) {
					jssorSlider.$ScaleWidth(expectedWidth);
				}
				else {
					var expectedheight = (expectedWidth * 63) / 140;
					jssorSlider.$ScaleSize(containerWidth, expectedheight);
				}
			}
			else if (sliderContainerId == "sliderContainer3") {
				var expectedWidth = Math.min(containerWidth, 1000);
				if (containerWidth > 479) {
					jssorSlider.$ScaleWidth(expectedWidth);
				}
				else {
					var expectedheight = (expectedWidth * 90) / 240;
					jssorSlider.$ScaleSize(containerWidth, expectedheight);
				}
			}
			else if (sliderContainerId == "sliderContainer4") {
				var expectedWidth = Math.min(Number(MAX_WIDTH) || containerWidth, containerWidth);
				if (containerWidth > 479) {
					jssorSlider.$ScaleWidth(expectedWidth);
				}
				else {
					var expectedheight = (expectedWidth * 53) / 140;
					jssorSlider.$ScaleSize(containerWidth, expectedheight);
				}
			}
			else if (sliderContainerId == "sliderContainer6") {
				var expectedWidth = Math.min(containerWidth, 2600);
				if (containerWidth > 479) {
					jssorSlider.$ScaleWidth(expectedWidth);
				}
				else {
					var expectedheight = (expectedWidth * 80) / 95;
					jssorSlider.$ScaleSize(containerWidth, expectedheight);
				}
			}
			else if (sliderContainerId == "sliderContainer7") {
				var expectedWidth = Math.min(containerWidth, 1000);

				if (containerWidth > 479) {
					jssorSlider.$ScaleWidth(expectedWidth);
				}
				else {
					var expectedheight = (expectedWidth * 90) / 240;
					jssorSlider.$ScaleSize(containerWidth, expectedheight);
				}
			}

		}
		else {
			window.setTimeout(ScaleSlider(jssorSlider), 30);
		}
	}
	$Jssor$.$AddEvent(window, "load", ScaleSlider(jssorSlider));
	$Jssor$.$AddEvent(window, "resize", ScaleSlider(jssorSlider));
	$Jssor$.$AddEvent(window, "orientationchange", ScaleSlider(jssorSlider));

	jssorSlider.$On($JssorSlider$.$EVT_DRAG_END, isSliderDragged);
	jssorSlider.$On($JssorSlider$.$EVT_SWIPE_END, keyboardSwipe);
	jssorSlider.$On($JssorSlider$.$EVT_POSITION_CHANGE, function (position, startPosition) {
		window.dispatchEvent(new CustomEvent('slider-positionChange-event', {
			detail: { id: sliderContainerId, count: position, prevoius: startPosition }
		}));
	});

	return jssorSlider;
}

function isSliderDragged() {
	window.dispatchEvent(new Event('slider-drag-event'));
}

function keyboardSwipe() {
	window.dispatchEvent(new Event('key-swipe'));
}
