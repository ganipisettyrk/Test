import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HeaderResolverComponent } from './header-resolver.component';
import { OoredoHeaderResolverComponent } from './ooredo-header-resolver/ooredo-header-resolver.component';
import { ContestMsisdnResolverComponent } from './contest-msisdn-resolver/contest-msisdn-resolver.component';

const routes: Routes = [
  { path: '', component: HeaderResolverComponent },
  { path: 'ooredo', component: OoredoHeaderResolverComponent },
  { path: 'contest', component: ContestMsisdnResolverComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HeaderResolverRoutingModule { }
