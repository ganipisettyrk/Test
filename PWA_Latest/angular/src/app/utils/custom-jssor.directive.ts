import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { CustomScriptLoaderService, ScriptItem } from './custom-script-loader.service';
import { JssorService } from './jssor.service';

declare var InitSlider: any;

@Directive({
  selector: '[appCustomJssor]'
})
export class CustomJssorDirective {

  @Input() isLast: string;
  @Input() sliderId: string;
  @Input() sliderIndex: string;
  @Output() sliderInstance = new EventEmitter<any>();

  constructor(private customScriptLoader: CustomScriptLoaderService, private jssorService: JssorService) { }

  ngOnInit() {

    if (this.isLast == "true") {
      if (!this.jssorService.isJssorInitialized) {
        this.loadJssorScripts();
      } else {
        if (this.jssorService.getIsJssorInitializeComplete()) {
          this.InitializeSlider();
        } else {
          setTimeout(() => {
            this.checkAndUpdate();
          }, 10);
        }
      }
    }
  }

  private checkAndUpdate() {
    if (this.jssorService.getIsJssorInitializeComplete()) {
      this.InitializeSlider();
    } else {
      setTimeout(() => {
        this.checkAndUpdate();
      }, 10);
    }
  }

  private loadJssorScripts() {

    this.jssorService.isJssorInitialized = true;
    let jssorScriptItem: ScriptItem = { name: "jssor", src: "scripts/jssor.slider.min.js" };
    this.customScriptLoader.loadScript(jssorScriptItem).subscribe(
      (jssorRes: boolean) => {
        if (jssorRes) {
          let scriptItem: ScriptItem = { name: "jssorOM", src: "scripts/jssorOM.min.js" };
          this.customScriptLoader.loadScript(scriptItem).subscribe(
            (res: boolean) => {
              if (res) {
                this.jssorService.setIsJssorInitializeComplete(true);
                setTimeout(() => {
                  this.InitializeSlider();
                }, 50);
              }
            });
        }
      });

  }

  private InitializeSlider() {

    if (this.sliderId == "1") {
      let contentSlider = InitSlider("sliderContainer1", 2500, 1, 600, 10, 0);
      this.sliderInstance.emit(contentSlider);
    }
    else if (this.sliderId == "2") {
      InitSlider("sliderContainer2", 1000, 0, 138, 5, 0);
    }
    else if (this.sliderId == "3") {
      InitSlider("sliderContainer3", 1000, 0, 193, 8, 0);
    }
    else if (this.sliderId == "4") {
      InitSlider("sliderContainer4", 1000, 0, 193, 0, 0)
    }
    else if (this.sliderId == "5") {
      InitSlider("sliderContainer5", 1000, 0, 138, 5, 0);
    }
    else if (this.sliderId == "6") {
      let contentSlider = InitSlider("sliderContainer6", 2500, 0, 500, 0, this.sliderIndex);
      this.sliderInstance.emit(contentSlider);
    }
    else if (this.sliderId == "7") {
      let contentSlider = InitSlider("sliderContainer7", 1000, 0, 193, 8, 0);
      this.sliderInstance.emit(contentSlider);
    }
    else if (this.sliderId == "8") {
      InitSlider("sliderContainer8", 1000, 0, 138, 5, 0);
    }

  }

}
