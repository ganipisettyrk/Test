import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpRequestService } from '../utils/http-request.service';

@Injectable()
export class SearchTagsService {

    constructor(private httpService: HttpRequestService) { }

    private showSearchTags = new Subject<boolean>();
    showSearchTags$ = this.showSearchTags.asObservable();

    emitShowSearchTags(showSearchTags: boolean) {
        this.showSearchTags.next(showSearchTags);
    }

    getTrendingSearchTags(browsingLang: string): Observable<any> {
        let params = [];
        params.push({ paramName: 'browsingLanguage', paramValue: browsingLang });

        return this.httpService.get('getsearchtags', params);
    }
}