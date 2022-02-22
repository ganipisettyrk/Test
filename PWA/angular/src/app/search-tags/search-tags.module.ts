import { NgModule } from "@angular/core";
import { SearchService } from '../search/search.service';
import { SharedModule } from "../utils/shared.module";
import { SearchTagsRoutingModule } from "./search-tags-routing.module";
import { SearchTagsComponent } from './search-tags.component';
import { SearchTagsService } from './search-tags.service';

@NgModule({
    imports: [SharedModule, SearchTagsRoutingModule],
    declarations: [SearchTagsComponent],
    providers: [SearchTagsService, SearchService]
})

export class SearchTagsModule { }
