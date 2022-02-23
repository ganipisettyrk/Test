import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { PopupDataItem, PopupService } from 'src/app/popup/popup.service';
import { CustomTranslateService } from 'src/app/utils/custom-translate.service';
import { CommonService } from './../../utils/common.service';
import { menuItem, MenuService } from './menu.service';

declare var $: any;

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  menuSettingsItems: menuItem[];
  menuAboutItems: menuItem[];
  @Output() displayMenuValue = new EventEmitter<boolean>();
  activityMenuItem: menuItem = { displayText: null, url: '/activity', value: null };;
  showUnsubscribe:boolean = false;

  constructor(private menuService: MenuService, private router: Router,
    private popupService: PopupService, private translate: CustomTranslateService,
    private commonService: CommonService) {

  }

  ngOnInit() {
    this.getMenuSettingsContents();
    this.getMenuAboutContents();
  }

  private getMenuSettingsContents() {
    this.menuService.populateMenuSettingsItems().then(menuItems => {
      this.menuSettingsItems = menuItems;
    });
  }

  private getMenuAboutContents() {
    this.menuService.populateMenuAboutItems().then(menuItems => {
      this.menuAboutItems = menuItems;
      let loggedIn = sessionStorage.getItem("loggedIn") == "true";
      let unsubscribeRequested = sessionStorage.getItem('UNSUBSCRIBE_REQUESTED') == 'true';
      let showUnsubscribeConfig = this.translate.instant('pwa.menu.show.unsubscribe') == 'true';
      let statusConfig = this.translate.instant('pwa.user.status.to.show.unsubscribe');
      let myAccountDetails = JSON.parse(sessionStorage.getItem("PlanDetails"));
      if (myAccountDetails) {
        let userStatus: string = myAccountDetails.Subscription_status;
        if (loggedIn && showUnsubscribeConfig && statusConfig.includes(userStatus) && !unsubscribeRequested) {
          this.showUnsubscribe = true;
        }
      }
    });
  }

  populateFeature(menuItem: menuItem): void {
    let url: string = menuItem.url;
    this.closeMenu();
    if (url == "language") {
      this.menuService.getContentLanguages().subscribe(res => {
        let item = res;
        this.translate.get("pwa.content.language.heading").subscribe(res => {
          let heading = res;
          let popupItem: PopupDataItem = {
            isLoggedIn: null,
            type: "language",
            popupData: item,
            heading: heading,
            response: null,
            showCloseButton: true,
            historyIndex: "",
            pageName: "",
            isSetForNone: false
          };
          this.popupService.showPopup(popupItem);
        });
      });
    } else if (url == 'changenumber') {
      this.commonService.initiateLoginOrAction(null, 'changenumber', false, null, false);
    } else if (url == "/contestWinnerBoard" || url == "/contestPlayWin") {
      this.commonService.redirectToContest(url);
    } else if (url == "/userfeedback") {
      this.commonService.initiateLoginOrAction(null, 'userfeedback', false, null, false);
    } else if (url == "/activity") {
      this.commonService.initiateLoginOrAction(null, 'activity', false, null, false);
    } else {
      this.router.navigateByUrl(url);
    }
  }

  private closeMenu(): void {
    this.displayMenuValue.emit(false);
    this.commonService.startBackgroundScroll();
    $('#new_overlay_menu').toggle();
    $('.navigation').toggleClass('visible');
  }

  public isMyAccountUrl(menuItem): boolean {
    let url = this.translate.instant('pwa.menu.settings.myaccount.url');
    if (url == menuItem.url) {
      return true;
    } else {
      return false;
    }
  }

  public showMyAccountPrice(menuItem): boolean {
    if (menuItem.value != null) {
      return true;
    } else {
      return false;
    }
  }

  public confirmUnsubscribe() {
    this.closeMenu();
    this.translate.get("pwa.unsubscribe.popup.heading")
      .subscribe(res => {
        let heading = res;
        let popupItem: PopupDataItem = {
          isLoggedIn: null,
          type: "unsubscribe",
          popupData: null,
          heading: heading,
          response: null,
          showCloseButton: true,
          historyIndex: "",
          pageName: "",
          isSetForNone: false
        };
        this.popupService.showPopup(popupItem);
      });
  }
}
