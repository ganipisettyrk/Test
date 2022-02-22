import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NametuneDataComponent } from './nametune-data.component';

describe('NametuneDataComponent', () => {
  let component: NametuneDataComponent;
  let fixture: ComponentFixture<NametuneDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NametuneDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NametuneDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
