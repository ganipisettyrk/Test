import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpRequestService } from '../utils/http-request.service';
import { RouterTestingModule } from '@angular/router/testing';
import { SearchTagsComponent } from './search-tags.component';
import { SearchTagsService } from './search-tags.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { Router } from '@angular/router';

describe('SearchTagsComponent', () => {
  let component: SearchTagsComponent;
  let fixture: ComponentFixture<SearchTagsComponent>;
  // let service: SearchTagsService;
  let searchTagsServiceSpy = jasmine.createSpyObj( {getTrendingSearchTags: null});
  
  // let spy: any;
  let router: Router;
  // let httpHandler: HttpHandler;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchTagsComponent ],
      imports: [RouterTestingModule.withRoutes('/more/trending/**')],
      providers: [
        { provide: SearchTagsService, useValue: searchTagsServiceSpy }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    // service = new SearchTagsService(new HttpRequestService(new HttpClient(httpHandler)));
    router = TestBed.get(Router);
    fixture = TestBed.createComponent(SearchTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    // service = null;
    component = null;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // describe('Method: showTrendingSearchTags', () => {
  //   it('should call the `getTrendingSearchTags` method in `SearchTagsService`', () => {
  //     spy = spyOn(service, 'getTrendingSearchTags');
  //     component.showTrendingSearchTags('en');
  //     expect(spy).toHaveBeenCalled();
  //   });
  // });

  it('showTrendingSearchTags() should call getTrendingSearchTags()', () => {
    component.showTrendingSearchTags('en');
    expect(searchTagsServiceSpy.getTrendingSearchTags.toHaveBeenCalled());
  });

  // describe('Method: redirectToCategoryURL', () => {
  //   it('should navigate to searchTag url', () => {
  //     const navigetSpy = spyOn(router, 'navigate');
  //     component.redirectToCategoryURL('100', 'dummyCategory');
  //     expect(navigetSpy).toHaveBeenCalledWith(['/more/trending/100']);
  //   });
  // });

  it('#redirectToCategoryURL should navigate to respective categoy url', () => {
    const navigetSpy = spyOn(router, 'redirectToCategoryURL');
    component.redirectToCategoryURL('100', 'dummyCategory');
    expect(navigetSpy).toHaveBeenCalledWith(['/more/trending/100']);
  });

});
