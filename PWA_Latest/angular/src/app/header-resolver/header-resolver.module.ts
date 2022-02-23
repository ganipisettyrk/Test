import { NgModule } from '@angular/core';
import { SharedModule } from '../utils/shared.module';
import { HeaderResolverRoutingModule } from './header-resolver-routing.module';
import { HeaderResolverComponent } from './header-resolver.component';
import { OoredoHeaderResolverComponent } from './ooredo-header-resolver/ooredo-header-resolver.component';
import { ContestMsisdnResolverComponent } from './contest-msisdn-resolver/contest-msisdn-resolver.component';

@NgModule({
  declarations: [HeaderResolverComponent, OoredoHeaderResolverComponent, ContestMsisdnResolverComponent],
  imports: [HeaderResolverRoutingModule, SharedModule]
})
export class HeaderResolverModule { }
