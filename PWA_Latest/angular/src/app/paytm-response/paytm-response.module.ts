import { NgModule } from '@angular/core';
import { SharedModule } from '../utils/shared.module';
import { PaytmResponseRoutingModule } from './paytm-response-routing.module';
import { PaytmResponseComponent } from './paytm-response.component';
import { PaytmResponseService } from './paytm-response.service';

@NgModule({
  imports: [SharedModule, PaytmResponseRoutingModule],
  declarations: [PaytmResponseComponent],
  providers: [PaytmResponseService]
})

export class PaytmResponseModule { }