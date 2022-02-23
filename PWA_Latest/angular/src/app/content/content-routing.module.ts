import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContentComponent } from './content.component';

const routes: Routes = [
  //param1 - contentIndex/ ContentId
  //param2 - chartId/ contentType
  //contentIndex, contentIndex/chartId, contentId/contentType
  {
    path: ':param1/:param2',
    children: [
      {
        path: '', component: ContentComponent
      },
      {
        path: ':param3/:param4',
        children: [
          {
            path: '', component: ContentComponent
          },
          {
            path: '**', component: ContentComponent
          }
        ]
      }
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContentRoutingModule { }
