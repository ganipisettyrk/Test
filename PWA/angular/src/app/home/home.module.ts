import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SearchService } from '../search/search.service';
import { SliderComponent } from '../slider/slider.component';
import { SliderService } from '../slider/slider.service';
import { ChartService } from '../utils/chart.service';
import { RecommendationService } from '../utils/recommendation.service';
import { SharedModule } from '../utils/shared.module';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';

@NgModule({
  declarations: [HomeComponent, SliderComponent],
  imports: [HomeRoutingModule, SharedModule, CommonModule],
  providers: [SliderService, ChartService, SearchService, RecommendationService]

})
export class HomeModule { }
