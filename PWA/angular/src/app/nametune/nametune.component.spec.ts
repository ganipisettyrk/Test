import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NametuneComponent } from './nametune.component';

describe('NametuneComponent', () => {
  let component: NametuneComponent;
  let fixture: ComponentFixture<NametuneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NametuneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NametuneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
