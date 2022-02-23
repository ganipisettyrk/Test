import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RtStoreComponent } from './rt-store.component';

describe('RtStoreComponent', () => {
  let component: RtStoreComponent;
  let fixture: ComponentFixture<RtStoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RtStoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RtStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
