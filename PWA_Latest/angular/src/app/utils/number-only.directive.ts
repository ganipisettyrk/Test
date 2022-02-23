import { Directive } from '@angular/core';
import { NgModel } from '@angular/forms';

@Directive({
  selector: '[appNumberOnly]'
  ,
  providers: [NgModel],
  host: {
    '(ngModelChange)': 'onInputChange($event)'
  }
})

export class NumberOnlyDirective {

  constructor(private model: NgModel) { }

  onInputChange(event) {
    this.model.valueAccessor.writeValue(event.toLowerCase().replace(/[^0-9]/g, ''));
  }
}