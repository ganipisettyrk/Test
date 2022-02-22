import { NgModule } from '@angular/core';
import { SearchService } from '../search/search.service';
import { ChartService } from '../utils/chart.service';
import { RecommendationService } from '../utils/recommendation.service';
import { SharedModule } from '../utils/shared.module';
import { MoreRoutingModule } from './more-routing.module';
import { MoreComponent } from './more.component';

@NgModule({
  declarations: [MoreComponent],
  imports: [SharedModule, MoreRoutingModule],
  providers: [ChartService, SearchService, RecommendationService],
  exports: [MoreComponent]

})
export class MoreModule { }
