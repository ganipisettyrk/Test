import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentLanguageDataComponent } from './content-language-data.component';

describe('ContentLanguageDataComponent', () => {
  let component: ContentLanguageDataComponent;
  let fixture: ComponentFixture<ContentLanguageDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentLanguageDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentLanguageDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
