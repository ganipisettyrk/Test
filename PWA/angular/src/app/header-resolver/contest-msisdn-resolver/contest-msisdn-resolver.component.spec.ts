import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContestMsisdnResolverComponent } from './contest-msisdn-resolver.component';

describe('ContestMsisdnResolverComponent', () => {
  let component: ContestMsisdnResolverComponent;
  let fixture: ComponentFixture<ContestMsisdnResolverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContestMsisdnResolverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContestMsisdnResolverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
