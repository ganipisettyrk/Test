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
  let searchTagsServiceSpy = jasmine.createSpyObj('SearchTagsService', 'getTrendingSearchTags');
  
  // let spy: any;
  let router: Router;
  // let httpHandler: HttpHandler;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchTagsComponent ],
      imports: [RouterTestingModule.withRoutes([])],
      providers: [
        { provide: SearchTagsService, useValue: searchTagsServiceSpy }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    // service = new SearchTagsService(new HttpRequestService(new HttpClient(httpHandler)));
    fixture = TestBed.createComponent(SearchTagsComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
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

  it('should navigate to searchTag url', () => {
    const navigetSpy = spyOn(router, 'navigate');
    component.redirectToCategoryURL('100', 'dummyCategory');
    expect(navigetSpy).toHaveBeenCalledWith(['/more/trending/100']);
  });
  
});
