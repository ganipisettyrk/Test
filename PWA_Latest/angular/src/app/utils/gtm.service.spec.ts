import { TestBed } from '@angular/core/testing';

import { GtmService } from './gtm.service';

describe('GtmService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GtmService = TestBed.get(GtmService);
    expect(service).toBeTruthy();
  });
});
