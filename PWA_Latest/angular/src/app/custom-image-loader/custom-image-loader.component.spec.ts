import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomImageLoaderComponent } from './custom-image-loader.component';

describe('CustomImageLoaderComponent', () => {
  let component: CustomImageLoaderComponent;
  let fixture: ComponentFixture<CustomImageLoaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomImageLoaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomImageLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
