import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RtStoreComponent } from './rt-store.component';

const routes: Routes = [
  { path: '', component: RtStoreComponent },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RtStoreRoutingModule { }
