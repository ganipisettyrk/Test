import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaytmResponseComponent } from './paytm-response.component';

const routes: Routes = [
    { path: '', component: PaytmResponseComponent }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class PaytmResponseRoutingModule { }