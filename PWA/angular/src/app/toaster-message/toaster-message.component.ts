import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { CustomTranslateService } from '../utils/custom-translate.service';
import { ToasterMessageService } from './toaster-message.service';

@Component({
  selector: 'app-toaster-message',
  templateUrl: './toaster-message.component.html',
  styleUrls: ['./toaster-message.component.css']
})
export class ToasterMessageComponent implements OnInit {

  showMessage: boolean = false;
  type: string;
  message: string;

  constructor(private translate: CustomTranslateService,
    private toasterMessageService: ToasterMessageService,
    private swUpdate: SwUpdate) { }

  ngOnInit() {

    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe((response) => {
        this.translate.get("pwa.warning.message.new.update.available").subscribe(
          res => {
            this.toasterMessageService.toggleToasterMessageDisplay(true, "warning", res);
          });
      });
    }

    this.toasterMessageService.getToasterMessageSource().subscribe(
      res => {
        if (null != res) {
          this.showMessage = res;
          this.type = this.toasterMessageService.type;
          this.message = this.toasterMessageService.message;
        }
      });
  }

}
