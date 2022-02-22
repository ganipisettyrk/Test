import { TestBed } from '@angular/core/testing';

import { ToasterMessageService } from './toaster-message.service';

describe('ToasterMessageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ToasterMessageService = TestBed.get(ToasterMessageService);
    expect(service).toBeTruthy();
  });
});
