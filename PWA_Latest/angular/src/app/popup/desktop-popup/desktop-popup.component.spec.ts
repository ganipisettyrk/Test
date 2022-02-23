import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DesktopPopupComponent } from './desktop-popup.component';

describe('DesktopPopupComponent', () => {
  let component: DesktopPopupComponent;
  let fixture: ComponentFixture<DesktopPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DesktopPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesktopPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
