import { TestBed } from '@angular/core/testing';

import { JssorService } from './jssor.service';

describe('JssorService', () => {
  let service: JssorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JssorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
