import { CommonModule, CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ChartContentComponent } from '../chart-content/chart-content.component';
import { CustomImageLoaderComponent } from '../custom-image-loader/custom-image-loader.component';
import { RtSliderComponent } from '../ringtone/rt-slider/rt-slider.component';
import { ToasterMessageComponent } from '../toaster-message/toaster-message.component';
import { UserActivityService } from '../user-activity/user-activity.service';
import { CustomEllipsePipe } from './custom-ellipse.pipe';
import { CustomFocusDirective } from './custom-focus.directive';
import { CustomJssorDirective } from './custom-jssor.directive';
import { CustomTranslatePipe } from './custom-translate.pipe';
import { SanitizeHtmlPipe } from './sanitize-html.pipe';
import { ShuffleDetailsPipe } from './shuffle-details.pipe';

@NgModule({
  exports: [CommonModule, FormsModule, CustomJssorDirective, CustomImageLoaderComponent,
    ChartContentComponent, TranslateModule, SanitizeHtmlPipe, CustomFocusDirective, ReactiveFormsModule, ToasterMessageComponent, CustomTranslatePipe,
    RtSliderComponent, InfiniteScrollModule, CustomEllipsePipe, ShuffleDetailsPipe
  ],
  declarations: [CustomJssorDirective, CustomImageLoaderComponent, ChartContentComponent,
    SanitizeHtmlPipe, CustomFocusDirective, ToasterMessageComponent,
    CustomTranslatePipe, RtSliderComponent, CustomEllipsePipe, ShuffleDetailsPipe
  ],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, InfiniteScrollModule, TranslateModule],
  providers: [CurrencyPipe, DatePipe, TitleCasePipe, UserActivityService, CustomEllipsePipe, ShuffleDetailsPipe],

})
export class SharedModule { }
