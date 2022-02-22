import { TestBed } from '@angular/core/testing';

import { CustomStatusService } from './custom-status.service';

describe('CustomStatusService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CustomStatusService = TestBed.get(CustomStatusService);
    expect(service).toBeTruthy();
  });
});
