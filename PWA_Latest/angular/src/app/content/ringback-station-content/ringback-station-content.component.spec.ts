import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RingbackStationContentComponent } from './ringback-station-content.component';

describe('RingbackStationContentComponent', () => {
  let component: RingbackStationContentComponent;
  let fixture: ComponentFixture<RingbackStationContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RingbackStationContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RingbackStationContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
