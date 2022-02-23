import { Component, ComponentFactoryResolver, EventEmitter, Input, NgModule, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { RingbackStationContentComponent } from '../content/ringback-station-content/ringback-station-content.component';
import { NumberOnlyDirective } from '../utils/number-only.directive';
import { SharedModule } from '../utils/shared.module';
import { ContentLanguageDataComponent } from './content-language-data/content-language-data.component';
import { DataPopupComponent } from './data-popup/data-popup.component';
import { DeletePopupDataComponent } from './delete-popup-data/delete-popup-data.component';
import { DesktopPopupComponent } from './desktop-popup/desktop-popup.component';
import { LoginDataComponent } from './login-data/login-data.component';
import { MobilePopupComponent } from './mobile-popup/mobile-popup.component';
import { NametuneDataComponent } from './nametune-data/nametune-data.component';
import { PopupService } from './popup.service';
import { ProfilePurchaseDataComponent } from './profile-purchase-data/profile-purchase-data.component';
import { PurchaseDataComponent } from './purchase-data/purchase-data.component';
import { PurchaseUpgradeDataComponent } from './purchase-upgrade-data/purchase-upgrade-data.component';
import { RtPurchaseDataComponent } from './rt-purchase-data/rt-purchase-data.component';
import { UnsubscribePopupComponent } from './unsubscribe-popup/unsubscribe-popup.component';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css']
})

export class PopupComponent implements OnInit {

  @ViewChild('dynamicComponent', { static: true, read: ViewContainerRef }) dynamicComponent;
  @Input() isMobile: boolean;
  @Output() componentLoaded = new EventEmitter<boolean>();

  constructor(private popupService: PopupService,
    private componentFactoryResolver: ComponentFactoryResolver) {
  }

  ngOnInit() {
    this.popupService.getShowPopUpSource().subscribe(
      res => {
        if (res) {
          this.loadComponents();
        }
      });

    this.componentLoaded.emit(true);
  }


  loadComponents() {
    let componentFactory = null;
    if (this.isMobile) {
      componentFactory = this.componentFactoryResolver.resolveComponentFactory(MobilePopupComponent);
    }
    else {
      componentFactory = this.componentFactoryResolver.resolveComponentFactory(DesktopPopupComponent);
    }
    const viewContainerRef = this.dynamicComponent.createComponent(componentFactory);
    viewContainerRef.changeDetectorRef.detectChanges();
  }
}

@NgModule({
  imports: [SharedModule],
  declarations: [PopupComponent, DesktopPopupComponent, MobilePopupComponent, DataPopupComponent,
    ContentLanguageDataComponent, NametuneDataComponent, LoginDataComponent, RingbackStationContentComponent,
    PurchaseDataComponent, ProfilePurchaseDataComponent, PurchaseUpgradeDataComponent, RtPurchaseDataComponent,
    UnsubscribePopupComponent, DeletePopupDataComponent, NumberOnlyDirective],
  entryComponents: [MobilePopupComponent, DesktopPopupComponent],
})
class PopupModule {
}