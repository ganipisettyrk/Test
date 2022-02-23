import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ErrorComponent } from './error/error.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'consent',
    loadChildren: () => import('./consent/consent.module').then(mod => mod.ConsentModule),
  },
  {
    path: 'content',
    loadChildren: () => import('./content/content.module').then(mod => mod.ContentModule),
  },
  {
    path: 'myaccount',
    loadChildren: () => import('./my-account/my-account.module').then(mod => mod.MyAccountModule),
  },
  {
    path: 'userfeedback',
    loadChildren: () => import('./feedback/feedback.module').then(mod => mod.FeedbackModule),
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(mod => mod.HomeModule),
  },
  {
    path: 'more',
    loadChildren: () => import('./more/more.module').then(mod => mod.MoreModule),
  },
  {
    path: 'page',
    loadChildren: () => import('./page/page.module').then(mod => mod.PageModule),
  },
  {
    path: 'search',
    loadChildren: () => import('./search/search.module').then(mod => mod.SearchModule),
  },
  {
    path: 'searchmore',
    loadChildren: () => import('./more/more.module').then(mod => mod.MoreModule),
    data: { rtcontent: false }
  },
  {
    path: 'rtsearchmore',
    loadChildren: () => import('./more/more.module').then(mod => mod.MoreModule),
    data: { rtcontent: true }
  },
  {
    path: 'searchtags',
    loadChildren: () => import('./search-tags/search-tags.module').then(mod => mod.SearchTagsModule),
  },
  {
    path: 'store',
    loadChildren: () => import('./store/store.module').then(mod => mod.StoreModule),
  },
  {
    path: 'moreshuffle',
    loadChildren: () => import('./store/store.module').then(mod => mod.StoreModule),
    data: { isShuffle: true }
  },
  {
    path: 'activity',
    loadChildren: () => import('./user-activity/user-activity.module').then(mod => mod.UserActivityModule),
  },
  {
    path: 'header',
    loadChildren: () => import('./header-resolver/header-resolver.module').then(mod => mod.HeaderResolverModule),
  },
  {
    path: 'paymentresp',
    loadChildren: () => import('./paytm-response/paytm-response.module').then(mod => mod.PaytmResponseModule),
  },
  {
    path: 'rtstore',
    loadChildren: () => import('./ringtone/rt-store/rt-store.module').then(mod => mod.RtStoreModule),
  },
  {
    path: 'rtcontent',
    loadChildren: () => import('./content/content.module').then(mod => mod.ContentModule),
    data: { rtcontent: true }
  },
  { path: 'error', component: ErrorComponent },
  { path: '**', component: ErrorComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'top'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
