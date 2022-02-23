import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../utils/common.service';
import { CustomTranslateService } from '../utils/custom-translate.service';
import { PageService } from './page.service';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.css']
})
export class PageComponent implements OnInit {

  data: string;
  headingText: string;

  constructor(private translate: CustomTranslateService, private pageService: PageService,
    private route: ActivatedRoute, private commonService: CommonService,
    private router: Router) {
  }

  ngOnInit() {

    this.commonService.getIsHeaderChecked().subscribe(result => {
      if (result) {
        this.getPageRouteDetails();
      }
    });

  }

  getPageRouteDetails() {
    this.route.params.subscribe(params => {
      let pageType: string = params['pageType'];
      this.translate.get('pwa.' + pageType + '.heading').subscribe(
        res => {
          this.headingText = res;
          // let url: string = this.translate.instant('pwa.' + pageType + '.url');
          if (null != pageType) {
            let isReloadRequired: boolean = this.commonService.checkIfReloadRequired();
            if (isReloadRequired) {
              location.reload();
            }
            else {
              this.getPageDetails(pageType);
            }
          }
        });
    }
    );
  }

  getPageDetails(pageType: string): void {

    this.data = null;
    this.pageService.getResponse(pageType)
      .subscribe(response => {
        let res = null;;
        if (pageType == "faq") {
          res = response.faq;
        } else if (pageType == "tnc") {
          res = response.terms;
        } else if (pageType == "aboutService") {
          res = response.manual;
        } else if (pageType == "privacyPolicy") {
          res = response.privacyPolicy;
        } else {
          res = response.result;
        }

        if (res == 'fileError' || res == 'fileNotExists') {
          // console.log("file not exist");
        } else {
          this.data = res;
        }
        setTimeout(() => {
          this.commonService.setFooterDisplayStatus(true);
        }, 2);
        this.commonService.setLoadFooterVal(true);
      },
        error => {
          this.router.navigateByUrl('/error');
        });

  }


}
