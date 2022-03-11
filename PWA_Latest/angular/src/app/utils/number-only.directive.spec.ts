import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, DebugElement } from "@angular/core";
import { By } from "@angular/platform-browser";
import { NumberOnlyDirective } from './number-only.directive';

@Component({
    template: `<input type="text" appNumberOnly>`
})
class TestNumbersOnlyComponent {
}

describe('Directive: CustomFocusDirective', () => {

    let component: TestNumbersOnlyComponent;
    let fixture: ComponentFixture<TestNumbersOnlyComponent>;
    let inputEl: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TestNumbersOnlyComponent, NumberOnlyDirective]
        });
        fixture = TestBed.createComponent(TestNumbersOnlyComponent);
        component = fixture.componentInstance;
        inputEl = fixture.debugElement.query(By.css('input'));
    });

    it('Should accept numbers only', () => {
        const focusedElem = fixture.debugElement.query(By.css(":focus"));
        expect(focusedElem).toBe(inputEl);
    });
});