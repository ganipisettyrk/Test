import { NgModule } from '@angular/core';
import { MoreModule } from '../more/more.module';
import { SearchService } from '../search/search.service';
import { ChartService } from '../utils/chart.service';
import { RecommendationService } from '../utils/recommendation.service';
import { SharedModule } from '../utils/shared.module';
import { StoreRoutingModule } from './store-routing.module';
import { StoreComponent } from './store.component';

@NgModule({
  declarations: [StoreComponent],
  imports: [StoreRoutingModule, SharedModule, MoreModule],
  providers: [ChartService, SearchService, RecommendationService],
  exports: [StoreComponent]
})
export class StoreModule { }
