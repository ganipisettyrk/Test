import { NgModule } from '@angular/core';
import { SharedModule } from '../utils/shared.module';
import { ConsentRoutingModule } from './consent-routing.module';
import { ConsentComponent } from './consent.component';
import { ConsentService } from './consent.service';

@NgModule({
  imports: [SharedModule, ConsentRoutingModule],
  declarations: [ConsentComponent],
  providers: [ConsentService]
})

export class ConsentModule { }