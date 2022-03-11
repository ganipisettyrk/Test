import { CustomJssorDirective } from './custom-jssor.directive';
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { JssorService } from './jssor.service';
import { CustomScriptLoaderService } from './custom-script-loader.service';

describe('CustomJssorDirective', () => {
  let directive: CustomJssorDirective;
  let fixture: ComponentFixture<CustomJssorDirective>;
  let scriptLoaderService: CustomScriptLoaderService;
  let jssorService: JssorService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CustomJssorDirective, JssorService]
    });
    
  }));
  
  beforeEach(() => {
    fixture = TestBed.createComponent(CustomJssorDirective);  
    directive = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create an instance', () => {
    const directive = new CustomJssorDirective(scriptLoaderService, jssorService);
    expect(directive).toBeTruthy();
  });
});
