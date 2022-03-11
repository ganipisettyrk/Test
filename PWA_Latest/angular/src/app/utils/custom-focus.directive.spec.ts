import { CustomFocusDirective } from './custom-focus.directive';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, DebugElement } from "@angular/core";
import { By } from "@angular/platform-browser";

@Component({
    template: `<input type="text" customFocus>`
})
class TestCustomFocusComponent {
}

describe('Directive: CustomFocusDirective', () => {

    let component: TestCustomFocusComponent;
    let fixture: ComponentFixture<TestCustomFocusComponent>;
    let inputEl: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TestCustomFocusComponent, CustomFocusDirective]
        });
        fixture = TestBed.createComponent(TestCustomFocusComponent);
        component = fixture.componentInstance;
        inputEl = fixture.debugElement.query(By.css('input'));
    });

    it('Should be focused on the view', () => {
        const focusedElem = fixture.debugElement.query(By.css(":focus"));
        expect(focusedElem).toBe(inputEl);
    });
});