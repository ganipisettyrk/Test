import { Component, Input, NgModule, OnInit } from '@angular/core';
import { CommonService } from '../utils/common.service';
import { SharedModule } from '../utils/shared.module';

@Component({
  selector: 'app-advertise',
  templateUrl: './advertise.component.html',
  styleUrls: ['./advertise.component.css']
})
export class AdvertiseComponent implements OnInit {

  @Input() heading: string;
  @Input() subHeading: string;
  @Input() buttonText: string;
  @Input() url: string;

  constructor(public commonService: CommonService) { }

  ngOnInit() {
  }

}

@NgModule({
  imports: [SharedModule],
  declarations: [AdvertiseComponent]
})
class AdvertiseModule {
}