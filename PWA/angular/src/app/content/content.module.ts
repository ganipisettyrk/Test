import { NgModule } from '@angular/core';
import { SearchService } from '../search/search.service';
import { ChartService } from '../utils/chart.service';
import { RecommendationService } from '../utils/recommendation.service';
import { SharedModule } from '../utils/shared.module';
import { ContentRoutingModule } from './content-routing.module';
import { ContentComponent } from './content.component';

@NgModule({
  declarations: [ContentComponent],
  imports: [ContentRoutingModule, SharedModule],
  providers: [ChartService, SearchService, RecommendationService]
})
export class ContentModule { }
