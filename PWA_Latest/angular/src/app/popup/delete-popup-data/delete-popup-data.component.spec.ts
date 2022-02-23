import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletePopupDataComponent } from './delete-popup-data.component';

describe('DeletePopupDataComponent', () => {
  let component: DeletePopupDataComponent;
  let fixture: ComponentFixture<DeletePopupDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeletePopupDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeletePopupDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
