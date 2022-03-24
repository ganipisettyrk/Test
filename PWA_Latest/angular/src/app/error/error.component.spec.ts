import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonService } from '../utils/common.service';

import { ErrorComponent } from './error.component';

describe('ErrorComponent', () => {
  let component: ErrorComponent;
  let fixture: ComponentFixture<ErrorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ErrorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('retrieves error description', waitForAsync(inject([CommonService], (commonService) => {
    commonService.getGenericErrorDescription().subscribe(result => expect(result).not.toBeNull());
    done();
  })));
});
