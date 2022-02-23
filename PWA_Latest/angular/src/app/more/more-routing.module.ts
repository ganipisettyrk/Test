import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MoreComponent } from './more.component';

const routes: Routes = [
  {
    path: ':type',
    children: [
      {
        path: '', component: MoreComponent
      },
      {
        path: ':id',
        children: [
          {
            path: '', component: MoreComponent
          },
          {
            path: ':albumName', component: MoreComponent
          },
          {
            path: '**', component: MoreComponent
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
export class MoreRoutingModule { }
