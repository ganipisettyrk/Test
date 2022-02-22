import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../utils/shared.module';
import { PageRoutingModule } from './page-routing.module';
import { PageComponent } from './page.component';
import { PageService } from './page.service';

@NgModule({
  declarations: [PageComponent],
  imports: [
    CommonModule, PageRoutingModule, SharedModule
  ],
  providers: [PageService]
})
export class PageModule { }
