import { SanitizeHtmlPipe } from './sanitize-html.pipe';
import { DomSanitizer } from '@angular/platform-browser';

describe('SanitizeHtmlPipe', () => {
  let sanitizer: DomSanitizer;
  
  beforeEach(() => {
    type sanitizer = typeof DomSanitizer;
  });

  it('create an instance', () => {
    const pipe = new SanitizeHtmlPipe(sanitizer);
    expect(pipe).toBeTruthy();
  });
});
