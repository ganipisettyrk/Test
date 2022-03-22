import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpRequestService } from '../utils/http-request.service';
import { RouterTestingModule } from '@angular/router/testing';
import { SearchTagsComponent } from './search-tags.component';
import { SearchTagsService } from './search-tags.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

describe('SearchTagsComponent', () => {
  let component: SearchTagsComponent;
  let fixture: ComponentFixture<SearchTagsComponent>;
  let service: SearchTagsService;
  let spy: any;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchTagsComponent ],
      imports: [RouterTestingModule.withRoutes([]),]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    service = new SearchTagsService(new HttpRequestService(new HttpClient));
    fixture = TestBed.createComponent(SearchTagsComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    service = null;
    component = null;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Method: showTrendingSearchTags', () => {
    it('should call the `getTrendingSearchTags` method in `SearchTagsService`', () => {
      spy = spyOn(service, 'getTrendingSearchTags');
      component.showTrendingSearchTags();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('Method: redirectToCategoryURL', () => {
    it('should navigate to searchTag url', () => {
      const navigetSpy = spyOn(router, 'navigate');
      component.redirectToCategoryURL('100', 'dummyCategory');
      expect(navigetSpy).toHaveBeenCalledWith(['/more/trending/100']);
    });
  });
  
});
