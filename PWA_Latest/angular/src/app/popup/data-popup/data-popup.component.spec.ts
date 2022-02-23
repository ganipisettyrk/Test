import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataPopupComponent } from './data-popup.component';

describe('DataPopupComponent', () => {
  let component: DataPopupComponent;
  let fixture: ComponentFixture<DataPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
