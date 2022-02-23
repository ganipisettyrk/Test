import { DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { SearchService } from '../search/search.service';
import { RecommendationService } from '../utils/recommendation.service';
import { SharedModule } from '../utils/shared.module';
import { UserActivityRoutingModule } from './user-activity-routing.module';
import { UserActivityComponent } from './user-activity.component';

@NgModule({
  declarations: [UserActivityComponent],
  imports: [UserActivityRoutingModule, SharedModule],
  providers: [DatePipe, SearchService, RecommendationService]
})

export class UserActivityModule { }
