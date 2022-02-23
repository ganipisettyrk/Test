import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RtSliderComponent } from './rt-slider.component';

describe('RtSliderComponent', () => {
  let component: RtSliderComponent;
  let fixture: ComponentFixture<RtSliderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RtSliderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RtSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
