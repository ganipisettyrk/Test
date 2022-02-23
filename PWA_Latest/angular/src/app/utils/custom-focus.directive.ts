import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[customFocus]'
})
export class CustomFocusDirective {

  @Input('customFocus') isFocused: boolean;

  constructor(private hostElement: ElementRef) { }

  ngOnInit() {
    if (this.isFocused) {
      this.hostElement.nativeElement.focus();
    }
  }

}
