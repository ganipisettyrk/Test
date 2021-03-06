import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartSliderComponent } from './chart-slider.component';

describe('ChartSliderComponent', () => {
  let component: ChartSliderComponent;
  let fixture: ComponentFixture<ChartSliderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartSliderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
