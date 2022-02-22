import { NgModule } from "@angular/core";
import { SearchTagsService } from "../search-tags/search-tags.service";
import { SharedModule } from "../utils/shared.module";
import { SearchRoutingModule } from "./search-routing.module";
import { SearchComponent } from "./search.component";
import { SearchService } from './search.service';

@NgModule({
  imports: [SharedModule, SearchRoutingModule],
  declarations: [SearchComponent],
  providers: [SearchTagsService, SearchService]
})

export class SearchModule { }
