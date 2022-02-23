import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShuffleSliderComponent } from './shuffle-slider.component';

describe('ShuffleSliderComponent', () => {
  let component: ShuffleSliderComponent;
  let fixture: ComponentFixture<ShuffleSliderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShuffleSliderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShuffleSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
