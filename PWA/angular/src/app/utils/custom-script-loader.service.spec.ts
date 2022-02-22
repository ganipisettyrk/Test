import { TestBed } from '@angular/core/testing';

import { CustomScriptLoaderService } from './custom-script-loader.service';

describe('CustomScriptLoaderService', () => {
  let service: CustomScriptLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomScriptLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
