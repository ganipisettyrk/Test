import { NgModule } from '@angular/core';
import { SearchService } from 'src/app/search/search.service';
import { ChartService } from 'src/app/utils/chart.service';
import { RecommendationService } from 'src/app/utils/recommendation.service';
import { MoreModule } from '../../more/more.module';
import { SharedModule } from '../../utils/shared.module';
import { RtStoreRoutingModule } from './rt-store-routing.module';
import { RtStoreComponent } from './rt-store.component';

@NgModule({
  declarations: [RtStoreComponent],
  imports: [RtStoreRoutingModule, SharedModule, MoreModule],
  providers: [ChartService, SearchService, RecommendationService],
  exports: [RtStoreComponent]
})
export class RtStoreModule { }
