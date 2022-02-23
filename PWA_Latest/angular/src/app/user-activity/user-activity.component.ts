import { DatePipe } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';
import { CustomTranslateService } from '../utils/custom-translate.service';
import { RecommendationService } from '../utils/recommendation.service';
import { CommonService } from './../utils/common.service';
import { UserActivityService } from './user-activity.service';
import { CustomEllipsePipe } from '../utils/custom-ellipse.pipe';

declare var $;

@Component({
  selector: 'app-user-activity',
  templateUrl: './user-activity.component.html',
  styleUrls: ['./user-activity.component.css']
})
export class UserActivityComponent implements OnInit {

  isMobile: boolean;
  showDownloads: boolean = false;

  dateFormat: any;
  playingForAllText: string;
  playingForSplText: string;
  playingForNoneText: string;

  setDateText: string;
  purchaseDateText: string;

  showShareIn3DotsMenu: boolean = false;
  currentIndex: any;
  clickedOn3dotsMenu: boolean = false;

  defaultImage: string;
  loadingImage: string;

  dataReady: boolean = false;

  showRTToggle: boolean = false;
  toggleValue: string = 'ct';
  rtOffset: number = 0;
  rtMaxItems: number;
  rtPurchaseHistoryData: any = [];
  rtPurchaseHistoryDataResult: any = [];
  rtTotal_Count: number = 0;

  historyData: any = [];
  historyDataResult: any = [];
  historyOffset = 0;
  historyMaxItems: number;
  historyTotal_Count: number = 0;

  selectionData: any = [];
  selectionDataResult: any = [];
  selectionOffset = 0;
  selectionMaxItems: number;
  selectionTotal_Count: any;

  showSetBtn = false;
  recommendationData: any = [];
  recommendationTotal_Count: any;

  recAlbumName: string;
  contentIds: string;

  trackNameSize: number;
  artistAlbumdisplayType: string;
  artistAlbumSize: number;

  constructor(private activityService: UserActivityService,
    private translate: CustomTranslateService,
    public commonService: CommonService,
    private datePipe: DatePipe,
    private router: Router,
    private recService: RecommendationService,
    private deviceService: DeviceDetectorService,
    private customEllipsePipe: CustomEllipsePipe) { }

  ngOnInit() {
    this.commonService.isUserLoggedIn()
      .subscribe((isLoggedIn: boolean) => {
        if (!isLoggedIn) {
          // If the user not logged in and trying to access activity page, will redirect him to home page.
          this.router.navigateByUrl('/home');
        }
        else {
          this.getData();
        }
      });
    this.activityService.getActivityToggle().subscribe(res => {
      this.dataReady = false;
      this.toggleValue = res;
      if (res == "rt") {
        this.getRtHistoryData(false, false);
      } else {
        this.getActivityDetails(false, false);
        this.getHistoryDetails(false, false);
      }
    });

  }

  private getData(): void {
    this.translate.get('pwa.activity.page.set.date.text')
      .subscribe(resp => {

        this.trackNameSize = this.translate.instant('pwa.track.name.length.limit');
        this.artistAlbumdisplayType = this.translate.instant('pwa.ringback.artistoralbum.display');
        this.artistAlbumSize = this.translate.instant('pwa.ringback.artistoralbum.length.limit');
        this.isMobile = this.deviceService.isMobile();
        this.setDateText = resp;
        this.purchaseDateText = this.translate.instant('pwa.activity.page.purchase.date.text');
        let rtToggle = this.translate.instant("pwa.activity.page.enable.rt.toggle").trim() == 'true';
        let rtToggleForDesktop = this.translate.instant("pwa.disable.rt.for.desktop").trim() == 'true';
        this.showSetBtn = this.translate.instant('pwa.show.direct.set.button').trim() == 'true';

        if (rtToggle) {
          if ((this.deviceService.isMobile() && this.deviceService.os == 'Android') || (this.deviceService.isTablet() && this.deviceService.os == 'Android')
            || (this.deviceService.isDesktop() && !rtToggleForDesktop && this.deviceService.os != 'Mac')) {
            this.showRTToggle = true;
            this.rtMaxItems = Number(this.translate.instant('pwa.user.rt.selections.per.page'));
          }
        }
        this.showDownloads = this.translate.instant('pwa.show.downloads.in.activity').trim() == 'true';
        this.defaultImage = this.translate.instant('pwa.user.activity.img.default');
        this.loadingImage = this.translate.instant('pwa.user.activity.img.loading');
        this.dateFormat = this.translate.instant('pwa.activity.page.date.format');
        this.playingForAllText = this.translate.instant('pwa.activity.page.playing.for.all.text');
        this.playingForSplText = this.translate.instant('pwa.activity.page.playing.for.spl.text');
        this.playingForNoneText = this.translate.instant('pwa.activity.page.playing.for.none.text');
        this.selectionMaxItems = Number(this.translate.instant('pwa.user.selections.per.page'));
        this.historyMaxItems = Number(this.translate.instant('pwa.user.history.selections.per.page'));
        this.showShareIn3DotsMenu = this.translate.instant('pwa.activity.show.share.3dots.menu').trim() == 'true';

        this.getActivityDetails(false, false);
        //this.getHistoryDetails(false, false);
        setTimeout(() => {
          this.commonService.setFooterDisplayStatus(true);
        }, 2);
      });
  }


  getActivityDetails(showMore: boolean, showLess: boolean): void {

    if (!showMore && !showLess) {
      if (this.selectionDataResult.length != 0) {
        this.dataReady = true;
        this.selectionData = [...this.selectionDataResult.slice(0, this.selectionMaxItems)];
        return;
      }
    } else if (showLess) {
      this.selectionData = [...this.selectionDataResult.slice(0, this.selectionMaxItems)];
      return;
    } else if (showMore) {
      if (this.selectionDataResult.length < this.selectionTotal_Count) {
        this.selectionOffset += this.selectionMaxItems;
      } else {
        let count = this.selectionData.length + this.selectionMaxItems;
        this.selectionData = [...this.selectionDataResult.slice(0, count)];
        return;
      }
    }

    if (this.showDownloads) {
      this.getDownloadsDetails();
    } else {
      let recommendationRequired: boolean = false;
      if (!showMore && !showLess) {
        if (this.selectionDataResult.length == 0) {
          recommendationRequired = true;
        }
      }
      this.getUserSelectionsDetails(recommendationRequired);
    }
  }

  private getUserSelectionsDetails(recommendationRequired: boolean): void {
    this.activityService.getUserSelections(this.selectionMaxItems, this.selectionOffset)
      .subscribe(resp => {

        if (resp == null) {
          this.router.navigateByUrl('/error');
        }
        else {
          if (resp.subCode && (resp.subCode.toUpperCase() == "SUBDOESNTEXIST" || resp.subCode.toUpperCase() == "PLAYRULENOTEXIST")) {
            this.dataReady = true;
          } else if (resp.status == 'failure') {
            this.dataReady = true;
            // console.log('Error while getting user selections..');
            this.router.navigateByUrl('/error');
          } else {
            let userSelections = resp.playrules;
            this.selectionTotal_Count = resp.total_count;

            this.activityService.getSubscribedContent(userSelections)
              .subscribe(
                contentRes => {
                  if (contentRes) {
                    for (let i = 0; i < contentRes.length; i++) {
                      if (i == 0 && recommendationRequired) {
                        this.recAlbumName = contentRes[0].album_name;
                      }
                      userSelections[i].contentObj = contentRes[i];
                      if (this.contentIds) {
                        this.contentIds += "," + contentRes[i].id;
                      }
                      else {
                        this.contentIds = contentRes[i].id;
                      }
                    }
                    this.selectionDataResult = this.selectionDataResult.concat(userSelections);
                    this.selectionData = [...this.selectionDataResult];
                    this.dataReady = true;
                    if (!this.isMobile && recommendationRequired) {
                      this.getRecommendationData(this.recAlbumName, this.contentIds);
                    }
                  }

                }, error => {
                  this.router.navigateByUrl('/error');
                });
          }

        }
        this.getHistoryDetails(false, false);
      }, error => {
        this.router.navigateByUrl('/error');
      });
  }

  private getRecommendationData(recAlbumName: string, contentIds: string) {
    let maxRecItems = Number(this.translate.instant('pwa.user.activity.recommedations.per.page'));

    this.recService.getMultiContentRecommendations(contentIds, 0, maxRecItems, recAlbumName)
      .subscribe(resp => {
        this.recommendationData = resp.items;
        this.recommendationTotal_Count = resp.total_item_count;
      });
  }

  private getDownloadsDetails(): void {
    let setForNoneAssets = [];
    // this.activityService.getListOfPurchasedContent()
    //   .subscribe(response => {
    //     if (response && response.count == 0) {
    //       this.dataReady = true;
    //     } else if (response && response.status == 'failure') {
    //       // console.log('Error while getting user downloads..');
    //       this.dataReady = true;
    //       this.router.navigateByUrl('/error');
    //     } else {
    //       let userDownloads = response.assets;
    this.activityService.getUserSelections(this.selectionMaxItems, this.selectionOffset)
      .subscribe(resp => {
        if (resp && resp.status == 'failure' && resp.subCode.toUpperCase() != "SUBDOESNTEXIST"
          && resp.subCode.toUpperCase() != "PLAYRULENOTEXIST") {
          // console.log('Error while getting user selections..');
          this.dataReady = true;
          this.router.navigateByUrl('/error');
        } else {
          let selections = resp.playrules;

          // Get content metadata for selections
          if (selections && selections.length > 0) {
            this.activityService.getSubscribedContent(selections)
              .subscribe(contentList => {
                for (let i = 0; i < contentList.length; i++) {
                  selections[i].contentObj = contentList[i];
                }
                this.selectionDataResult = this.selectionDataResult.concat(selections);
                this.selectionData = [...this.selectionDataResult];

              });
          }

          this.activityService.getListOfPurchasedContent()
            .subscribe(response => {
              if (response && response.count == 0) {
                this.dataReady = true;
              } else if (response && response.status == 'failure') {
                // console.log('Error while getting user downloads..');
                this.dataReady = true;
                this.router.navigateByUrl('/error');
              } else {
                let userDownloads = response.assets;
                for (let i = 0; i < userDownloads.length; i++) {
                  let selectionExists = false;
                  if (selections && selections.length > 0) {
                    let result = selections.find(x => x.asset.id == userDownloads[i].id);
                    if (result != null) {
                      selectionExists = true;
                    }
                  }
                  if (!selectionExists) {
                    let setForNoneAsset: any = { asset: null };
                    let asset: any = {};
                    asset.id = userDownloads[i].id;
                    if (userDownloads[i].type.toUpperCase() == 'SONG') {
                      asset.type = 'ringback';
                    } else if (userDownloads[i].type.toUpperCase() == 'RBTSTATION') {
                      asset.type = 'ringback_station';
                    }
                    setForNoneAsset.asset = asset;
                    setForNoneAssets.push(setForNoneAsset);
                  }
                }

                if (setForNoneAssets.length > 0) {
                  // Get content metadata for setfornone items
                  // insert some identifier to know setfornone or not
                  this.activityService.getSubscribedContent(setForNoneAssets)
                    .subscribe(setForNoneContentList => {
                      this.dataReady = true;
                      for (let i = 0; i < setForNoneContentList.length; i++) {
                        setForNoneAssets[i].contentObj = setForNoneContentList[i];
                        setForNoneAssets[i].isSetForNone = true;
                      }
                      this.selectionDataResult = this.selectionDataResult.concat(setForNoneAssets);
                      this.selectionData = [...this.selectionDataResult];
                    });
                } else {
                  this.dataReady = true;
                }
              }
            }, error => {
              this.router.navigateByUrl('/error');
            });
        }
        this.getHistoryDetails(false, false);
      }, error => {
        this.router.navigateByUrl('/error');
      });
  }

  getHistoryDetails(showMore: boolean, showLess: boolean): void {

    if (!showMore && !showLess) {
      if (this.historyDataResult.length != 0) {
        this.historyData = [...this.historyDataResult.slice(0, this.historyMaxItems)];
        return;
      }
    } else if (showLess) {
      this.historyData = [...this.historyDataResult.slice(0, this.historyMaxItems)];
      return;
    } else if (showMore) {
      if (this.historyDataResult.length < this.historyTotal_Count) {
        this.historyOffset += this.historyMaxItems;
      } else {
        let count = this.historyData.length + this.historyMaxItems;
        this.historyData = [...this.historyDataResult.slice(0, count)];
        return;
      }
    }

    this.activityService.getUserSelectionsHistory(this.historyMaxItems, this.historyOffset)
      .subscribe(resp => {
        const songList = resp.song_list;
        this.historyTotal_Count = resp.total_items_count;

        this.activityService.getDeactivatedTunesMetadata(songList)
          .subscribe(contentList => {
            this.historyDataResult = this.historyDataResult.concat(contentList);
            this.historyData = [...this.historyDataResult];
          }, error => {
            this.router.navigateByUrl('/error');
          });
      }, error => {
        this.router.navigateByUrl('/error');
      });
  }

  getSelectionSetDate(selection: any): any {
    if (selection && !selection.isSetForNone) {
      let selectionDate = selection.playruleinfo.set_time;
      selectionDate = selectionDate.replace(/-/g, '/');
      return this.datePipe.transform(selectionDate, this.dateFormat);
    } else {
      return '';
    }
  }

  getDisplayTextForCaller(selection: any): string {
    if (selection.isSetForNone) {
      return this.playingForNoneText;
    } else if (selection && selection.callingparty.type == 'default') {
      return this.playingForAllText;
    } else {
      return this.playingForSplText.replace('%CALLER%', selection.callingparty.id);
    }
  }

  show3DotMenuOptions(param): void {
    this.currentIndex = param;
    this.clickedOn3dotsMenu = true;
  }

  openDeleteSelectionPopup(selectionObj, index): void {
    this.commonService.toggleSliderButtonInActivitySelection(index);
    this.commonService.initiateLoginOrAction(selectionObj, 'delete_selection', false, index, false);
  }

  openDeleteDownloadPopup(selectionObj, index): void {
    this.commonService.toggleSliderButtonInActivitySelection(index);
    this.commonService.initiateLoginOrAction(selectionObj, 'delete_download', false, index, false);
  }

  openLoginOrSetPopup(item, index, isSetForNone?: boolean): void {
    if (isSetForNone) {
      this.commonService.toggleSliderButtonInActivitySelection(index);
      this.commonService.updateCT_SetObject(item, 'activity_setfornone');
      this.commonService.initiateLoginOrAction(item, 'activity_setfornone', false, index, false);
    } else {
      this.commonService.toggleSliderButtonInActivityHistory(index);
      this.commonService.updateCT_SetObject(item, 'activity_history');
      this.commonService.initiateLoginOrAction(item, 'activity_history', false, index, false);
    }
  }

  openLoginOrSetPopupRT(item, index) {
    this.commonService.initiateLoginOrAction(item, 'activity_RT', true, index, false)
  }

  getText1Details(item: any): string {
    let value: string = "";
    if (item.type == "ringback_station") {
      let trackName = this.customEllipsePipe.transform(item, item.type, this.trackNameSize);
      value = this.translate.instant("pwa.activity.page.shuffle.number.of.song.text",
        { trackName: trackName, noOfSongs: item.total_item_count });
    }
    else if (item.type == "ringback" || item.type == "realtone") {
      if (item.subtype.type == "ringback_nametune" || item.subtype.type == "ringback_meaningtune" || item.subtype.type == "ringback_professiontune" ||
        item.subtype.type == "ringback_profile" || this.commonService.isAzaan(item)) {
        value = this.customEllipsePipe.transform(item, item.type, this.trackNameSize);
      }
      else {
        value = this.customEllipsePipe.transform(item, this.artistAlbumdisplayType, this.artistAlbumSize);
      }
    }
    return value;
  }

  getText2Details(item: any): string {
    let value: string = "";
    if (item.type == "ringback_station") {
      value = this.translate.instant("pwa.activity.page.shuffle.text");
    }
    else if (item.type == "ringback" || item.type == "realtone") {
      if (item.subtype.type == "ringback_nametune") {
        value = this.translate.instant("pwa.activity.page.nametune.text");
      } else if (item.subtype.type == "ringback_meaningtune") {
        value = this.translate.instant("pwa.activity.page.meaningtune.text");
      } else if (item.subtype.type == "ringback_professiontune") {
        value = this.translate.instant("pwa.activity.page.professiontune.text");
      } else if (item.subtype.type == "ringback_profile") {
        value = this.translate.instant("pwa.activity.page.profile.text");
      } else if (this.commonService.isAzaan(item)) {
        value = this.translate.instant('pwa.activity.page.azan.song.text');
      } else {
        value = this.customEllipsePipe.transform(item, item.type, this.trackNameSize);
      }
    }

    return value;
  }

  getRtHistoryData(showMore: boolean, showLess: boolean): void {

    if (!showMore && !showLess) {
      if (this.rtPurchaseHistoryDataResult.length != 0) {
        this.rtPurchaseHistoryData = [...this.rtPurchaseHistoryDataResult.slice(0, this.rtMaxItems)];
        this.dataReady = true;
        return;
      }
    } else if (showLess) {
      this.rtPurchaseHistoryData = [...this.rtPurchaseHistoryDataResult.slice(0, this.rtMaxItems)];
      return;
    } else if (showMore) {
      if (this.rtPurchaseHistoryDataResult.length < this.rtTotal_Count) {
        this.rtOffset += this.rtMaxItems;
      } else {
        let count = this.rtPurchaseHistoryData.length + this.rtMaxItems;
        this.rtPurchaseHistoryData = [...this.rtPurchaseHistoryDataResult.slice(0, count)];
        return;
      }
    }

    this.activityService.getRtPurchaseHistory(this.rtMaxItems, this.rtOffset)
      .subscribe(resp => {
        if (resp && resp.records) {
          let rtdata = resp.records
          this.rtTotal_Count = resp.total_item_count;
          if (rtdata.length > 0) {
            this.activityService.getRtPurchaseHistoryContent(rtdata)
              .subscribe(contentRes => {
                if (contentRes) {
                  for (let i = 0; i < contentRes.length; i++) {
                    rtdata[i].contentObj = contentRes[i];
                    this.dataReady = true;
                  }
                  this.rtPurchaseHistoryDataResult = this.rtPurchaseHistoryDataResult.concat(rtdata);
                  this.rtPurchaseHistoryData = [...this.rtPurchaseHistoryDataResult];
                } else {
                  this.dataReady = true;
                }
              },
                error => {
                  this.dataReady = true;
                });
          } else {
            this.dataReady = true;
          }
        }
        else {
          this.dataReady = true;
        }
      },
        error => {
          this.router.navigateByUrl('/error');
        });

  }

  getRTDate(rtContent: any): any {
    if (rtContent && rtContent.purchase_details && rtContent.purchase_details.purchase_time) {
      let purchaseDate = rtContent.purchase_details.purchase_time;
      purchaseDate = purchaseDate.replace(/-/g, '/');
      return this.datePipe.transform(purchaseDate, this.dateFormat);
    } else {
      return '';
    }
  }

  @HostListener('document:click')
  clickout() {
    if (!this.clickedOn3dotsMenu) {
      $('.menu_knowmore').css('display', 'none');
    } else {
      $('.menu_knowmore').css('display', 'block');
    }
    this.clickedOn3dotsMenu = false;
  }

}


