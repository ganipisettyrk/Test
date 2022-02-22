import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SearchService } from '../search/search.service';
import { SharedModule } from '../utils/shared.module';
import { MyAccountRoutingModule } from './my-account-routing.module';
import { MyAccountComponent } from './my-account.component';

@NgModule({
  declarations: [MyAccountComponent],
  imports: [CommonModule, MyAccountRoutingModule, SharedModule],
  providers: [SearchService]
})
export class MyAccountModule { }
