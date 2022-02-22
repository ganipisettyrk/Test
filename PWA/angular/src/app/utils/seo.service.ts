import { Injectable } from '@angular/core';
import { CustomTranslateService } from './custom-translate.service';
import { Title, Meta } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SeoService {

  constructor(private title: Title, private meta: Meta,
    private translate: CustomTranslateService) { }

  public updateContentPageSeoDetails(contentObj: any): void {
    let operatorName: string = this.translate.instant("pwa.operator.name");
    this.title.setTitle(operatorName + " - " + contentObj.track_name);

    let keywords: string[] = contentObj.keywords;
    if (null == keywords) {
      keywords = [];
    }
    keywords.push(contentObj.track_name);
    keywords.push(contentObj.album_name);
    keywords.push(contentObj.primary_artist_name);
    keywords.push(operatorName);

    let keywordSet: Set<string> = new Set(keywords);
    let keywordsValue: string = "";
    let i = 0;
    for (let val of keywordSet) {
      if (i == 0) {
        keywordsValue = val;
      } else {
        keywordsValue += ", " + val;
      }
      i++;
    }

    this.meta.updateTag({
      name: 'keywords',
      content: keywordsValue
    });
    this.meta.updateTag({
      name: 'description',
      content: keywordsValue
    });
  }

  public updateChartPageSeoDetails(chartObj: any): void {
    let operatorName: string = this.translate.instant("pwa.operator.name");
    this.title.setTitle(operatorName + " - " + chartObj.chart_name);

    let keywords: string[] = [];

    keywords.push(chartObj.chart_name);
    if (null != chartObj.description) {
      keywords.push(chartObj.description);
    }
    keywords.push(operatorName);

    let keywordSet: Set<string> = new Set(keywords);
    let keywordsValue: string = "";
    let i = 0;
    for (let val of keywordSet) {
      if (i == 0) {
        keywordsValue = val;
      } else {
        keywordsValue += ", " + val;
      }
      i++;
    }

    this.meta.updateTag({
      name: 'keywords',
      content: keywordsValue
    });
    this.meta.updateTag({
      name: 'description',
      content: keywordsValue
    });
  }

  public updateHomePageSeoDetails(): void {
    this.translate.get("pwa.title.text").subscribe(
      res => {
        let title: string = res;
        let description: string = this.translate.instant("pwa.description.text");
        this.title.setTitle(title);
        this.meta.updateTag({
          name: 'description',
          content: description
        });
      }
    );
  }

}
