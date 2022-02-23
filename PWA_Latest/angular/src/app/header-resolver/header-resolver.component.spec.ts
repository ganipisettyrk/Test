import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderResolverComponent } from './header-resolver.component';

describe('HeaderResolverComponent', () => {
  let component: HeaderResolverComponent;
  let fixture: ComponentFixture<HeaderResolverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderResolverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderResolverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
