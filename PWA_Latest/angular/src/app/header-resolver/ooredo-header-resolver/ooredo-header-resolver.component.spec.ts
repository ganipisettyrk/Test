import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OoredoHeaderResolverComponent } from './ooredo-header-resolver.component';

describe('OoredoHeaderResolverComponent', () => {
  let component: OoredoHeaderResolverComponent;
  let fixture: ComponentFixture<OoredoHeaderResolverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OoredoHeaderResolverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OoredoHeaderResolverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
