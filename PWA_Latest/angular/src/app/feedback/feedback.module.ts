import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../utils/shared.module';
import { FeedbackRoutingModule } from './feedback-routing.module';
import { FeedbackComponent } from './feedback.component';
import { FeedbackService } from './feedback.service';

@NgModule({
  declarations: [FeedbackComponent],
  imports: [
    CommonModule, FeedbackRoutingModule, SharedModule
  ],
  providers: [FeedbackService]
})
export class FeedbackModule { }
