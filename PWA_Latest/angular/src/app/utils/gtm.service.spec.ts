import { TestBed } from '@angular/core/testing';

import { GTMService } from './gtm.service';

describe('GtmService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GTMService = TestBed.get(GTMService);
    expect(service).toBeTruthy();
  });
});
