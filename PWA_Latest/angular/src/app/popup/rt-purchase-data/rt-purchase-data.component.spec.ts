import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RtPurchaseDataComponent } from './rt-purchase-data.component';

describe('RtPurchaseDataComponent', () => {
  let component: RtPurchaseDataComponent;
  let fixture: ComponentFixture<RtPurchaseDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RtPurchaseDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RtPurchaseDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
