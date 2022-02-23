import { TestBed } from '@angular/core/testing';

import { GdprService } from './gdpr.service';

describe('GdprService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GdprService = TestBed.get(GdprService);
    expect(service).toBeTruthy();
  });
});
