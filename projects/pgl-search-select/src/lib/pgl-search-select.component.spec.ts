import {
    async,
    ComponentFixture,
    TestBed,
    fakeAsync,
    flush,
    tick,
    discardPeriodicTasks,
    waitForAsync,
} from "@angular/core/testing";

import {
    PGLSearchSelectComponent,
    PGLOptionDef,
    PGLEmptyOptionDef,
    PGLLoadingOptionDef,
} from "./pgl-search-select.component";
import { DebugElement, Component, ViewChild } from "@angular/core";
import { By } from "@angular/platform-browser";
import {
    BrowserAnimationsModule,
    NoopAnimationsModule,
} from "@angular/platform-browser/animations";
import { CommonModule } from "@angular/common";
import {
    ReactiveFormsModule,
    NgControl,
    UntypedFormControl,
    Validators,
} from "@angular/forms";
import {
    MatFormFieldModule,
    MAT_FORM_FIELD,
    MatFormField,
    MatLabel,
} from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatOptionModule, MatOption } from "@angular/material/core";
import { PglSearchSelectModule } from "./pgl-search-select.module";
import { of, throwError, Observable, Subject } from "rxjs";
import { delay, tap, map } from "rxjs/operators";
import { FocusMonitor } from "@angular/cdk/a11y";
import { OverlayContainer } from "@angular/cdk/overlay";

const { css, directive } = By;
const testStringOptions = ["name", "smith", "dave", "file"];
const testObjectOptions = [
    {
        key: "name",
        value: "dave",
    },
    {
        key: "family",
        value: "indeed",
    },
    {
        key: "valve",
        value: "elbow",
    },
];

describe("PglSearchSelectComponent in Test Component", () => {
    let parentComponent: TestComponent;
    let component: PGLSearchSelectComponent<any>;
    let parentFixture: ComponentFixture<TestComponent>;
    let componentDebugEl: DebugElement;
    let input: DebugElement;
    let inputEl: HTMLInputElement;
    let button: DebugElement;
    let buttonEl: HTMLButtonElement;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                CommonModule,
                ReactiveFormsModule,
                MatFormFieldModule,
                MatInputModule,
                MatAutocompleteModule,
                MatProgressBarModule,
                MatIconModule,
                MatButtonModule,
                MatOptionModule,
                NoopAnimationsModule,
            ],
            declarations: [
                PGLSearchSelectComponent,
                TestComponent,
                PGLOptionDef,
                PGLEmptyOptionDef,
                PGLLoadingOptionDef,
            ],
        })
            .compileComponents()
            .then(() => {
                parentFixture = TestBed.createComponent(TestComponent);
                parentComponent = parentFixture.componentInstance;
                componentDebugEl = parentFixture.debugElement.query(
                    directive(PGLSearchSelectComponent)
                )!;
                component = componentDebugEl.componentInstance;
                input = componentDebugEl.query(css("input"));
                inputEl = input.nativeElement as HTMLInputElement;
                button = componentDebugEl.query(css("button"));
                buttonEl = button.nativeElement as HTMLButtonElement;
            });
    }));

    it("should have Test(Parent) Component", () => {
        expect(parentComponent).toBeTruthy("Test component not found");
    });

    it("shoul have PGL search select component", () => {
        expect(component).toBeTruthy("PGLSearchSelectComponent not found");
    });

    it("should have form control", () => {
        expect(parentComponent.testControl).toBeTruthy(
            "Test control not found"
        );
        const formField = parentFixture.debugElement.query(
            directive(MatFormField)
        );
        expect(formField).toBeTruthy("Mat form field not found");
    });

    it("should have mat label", () => {
        parentComponent.label = "SearchString";
        parentFixture.detectChanges();
        const matLabel = parentFixture.debugElement.query(directive(MatLabel));
        expect(matLabel).toBeTruthy();
        expect(matLabel.nativeElement.textContent).toContain(
            parentComponent.label,
            `Mat Label expect: ${parentComponent.label}, got: ${matLabel.nativeElement.textContent}`
        );
    });

    // HIDE PLACEHOLDER
    it("should hide placeholder if label is present", () => {
        component.placeholder = "search";
        parentFixture.detectChanges();
        const matLabel = parentFixture.debugElement.query(directive(MatLabel));
        expect(matLabel).toBeNull("Found Mat label");
        const label = parentFixture.debugElement.query(css("label"));
        expect(label).toBeTruthy("did not find label");
        expect(label.nativeElement.textContent).toContain(
            component.placeholder,
            `Placeholder label extected: ${component.placeholder}, got: ${label.nativeElement.textContent}`
        );
    });

    it("should not use start with", fakeAsync(() => {
        component.options = testStringOptions;
        component.startWith = null;
        parentFixture.detectChanges();
        const optionSpy = jasmine.createSpy("Options subscription");
        component.options$.subscribe((val) => optionSpy(val));
        inputEl.dispatchEvent(new Event("focusin"));
        parentFixture.detectChanges();
        tick(component.searchWait);
        expect(optionSpy).not.toHaveBeenCalled();
        inputEl.value = "f";
        inputEl.dispatchEvent(new Event("input"));
        parentFixture.detectChanges();
        tick(component.searchWait);
        expect(optionSpy).toHaveBeenCalledWith(["file"]);
    }));

    it("should emit on filter", fakeAsync(() => {
        component.options = testObjectOptions;
        component.displayWith = parentComponent.displayWith2;
        component.filterWith = parentComponent.filterWith2;
        const emiter = jasmine.createSpy("On filter Emitter");
        component.onFilter.subscribe(emiter);
        parentFixture.detectChanges();
        inputEl.dispatchEvent(new Event("focusin"));
        inputEl.value = "f";
        inputEl.dispatchEvent(new Event("input"));
        parentFixture.detectChanges();
        tick(component.searchWait);
        expect(emiter).toHaveBeenCalledWith("f");
        discardPeriodicTasks();
    }));

    // it("should focus and change touched state", fakeAsync(() => {
    //     parentFixture.detectChanges();
    //     tick(100);
    //     const component = parentFixture.componentInstance.searchSelect;
    //     click(component.elementRef.nativeElement);
    //     tick();
    //     parentFixture.detectChanges();
    //     tick(300);
    //     expect(component.focused).toBe(true, "Component is not focused");

    //     expect(component.ngControl.touched).toBe(
    //         true,
    //         "NgControl is not touched"
    //     );
    //     flush();
    // }));

    // ERROR STATE
    // it("should change error state", () => {
    //     parentComponent.testControl.setValidators(Validators.required);
    //     component.options = testStringOptions;
    //     parentFixture.detectChanges();
    // });

    // FORM CONTROL
    it("should set access control if ngControl is not null", () => {
        parentFixture.detectChanges();
        expect(component.ngControl).not.toBeNull();
        expect(component.ngControl.valueAccessor).toEqual(component);
    });

    // SELECTING VALUE
    it("should select a value", fakeAsync(() => {
        component.options = testStringOptions;

        const onSelectEmittrSpy = jasmine.createSpy("On select Emitter spy");
        component.onSelect.subscribe((val) => onSelectEmittrSpy(val));
        const selectSpy = jasmine.createSpy("Select Spy");
        const actualSelect = component.select.bind(component);
        component.select = (e: any): void => {
            selectSpy(e);
            actualSelect(e);
        };
        parentFixture.detectChanges();
        const onChangeSpy = jasmine.createSpy("On change spy");
        component.registerOnChange(onChangeSpy);
        inputEl.dispatchEvent(new Event("focusin"));
        click(inputEl);
        tick(1000);
        parentFixture.detectChanges();
        tick(1000);
        const options = parentFixture.debugElement.queryAll(
            directive(MatOption)
        );

        expect(options).toBeTruthy("Could not find options");
        expect(options.length).toBe(testStringOptions.length);

        const toSelect = options.pop();
        click(toSelect);
        parentFixture.detectChanges();
        tick(1000);
        const compareOption = testStringOptions.slice().pop();
        expect(toSelect.componentInstance.selected).toBe(true);
        expect(selectSpy).toHaveBeenCalled();
        expect(onChangeSpy).toHaveBeenCalledWith(compareOption);
        expect(onSelectEmittrSpy).toHaveBeenCalledWith(compareOption);
    }));

    afterEach(() => {
        component.ngOnDestroy();
    })
});

describe("PglSearchSelectComponent", () => {
    let component: PGLSearchSelectComponent<any>;
    let fixture: ComponentFixture<PGLSearchSelectComponent<any>>;
    let el: DebugElement;
    let input: DebugElement;
    let button: DebugElement;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                CommonModule,
                ReactiveFormsModule,
                MatFormFieldModule,
                MatInputModule,
                MatAutocompleteModule,
                MatProgressBarModule,
                MatIconModule,
                MatButtonModule,
                MatOptionModule,
                NoopAnimationsModule,
            ],
            declarations: [
                PGLSearchSelectComponent,
                TestComponent,
                PGLOptionDef,
                PGLEmptyOptionDef,
                PGLLoadingOptionDef,
            ],
        })
            .compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(PGLSearchSelectComponent);
                // focusMonitorMock.monitor.and.returnValue(focusMonitor$.asObservable())
                component = fixture.componentInstance;
                el = fixture.debugElement;
                input = el.query(css("input"));
                button = el.query(css("button"));
            });
    }));

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("should have input", () => {
        expect(input).toBeTruthy("No input was found");
    });

    it("should have open/close button", () => {
        expect(button).toBeTruthy("No button was found");
    });

    it("should have options panel", () => {
        const autocomplete = el.query(css("mat-autocomplete"));
        expect(autocomplete).toBeTruthy("No mat-autocomplete element found");
    });

    it("should fire toggle method", () => {
        const mockToggle = spyOn(component, "toggle");
        click(button);
        fixture.detectChanges();
        expect(mockToggle).toHaveBeenCalledTimes(1);
    });
    it("should toggle visibity of options", async () => {
        const event = jasmine.createSpyObj("MouseEvent", [
            "preventDefault",
            "stopPropagation",
        ]);
        fixture.detectChanges();
        expect(component.autoComplete.autocomplete.isOpen).toBeFalse();
        component.options = testStringOptions;
        fixture.detectChanges();
        await fixture.whenStable();
        component.toggle(event);
        fixture.detectChanges();
        await fixture.whenStable();
        expect(component.autoComplete.autocomplete.isOpen).toBe(
            true,
            "Autocomplete did not open"
        );
        expect(event.preventDefault).toHaveBeenCalledTimes(1);
        expect(event.stopPropagation).toHaveBeenCalledTimes(1);

        component.toggle(event);
        fixture.detectChanges();
        await fixture.whenStable();
        expect(component.autoComplete.autocomplete.isOpen).toBe(
            false,
            "Autocomplete did not close"
        );
    });

    it("should start with full list", async () => {
        fixture.detectChanges();
        component.options = testStringOptions;
        await fixture.whenStable();

        component.toggle(ButtonClickEvents.left as any);
        fixture.detectChanges();
        await fixture.whenStable();

        const options = el.queryAll(css("mat-option"));
        expect(options).toBeTruthy("Did not find options");
        expect(options.length).toBe(4, "Incorrect number of options");
    });

    it("should button open and close options panel", async () => {
        fixture.detectChanges();
        component.options = testStringOptions;
        fixture.detectChanges();
        await fixture.whenStable();
        click(button);
        fixture.detectChanges();
        await fixture.whenStable();
        expect(component.autoComplete.autocomplete.isOpen).toBeTruthy(
            "options panel did not open"
        );
        click(button);
        fixture.detectChanges();
        expect(component.autoComplete.autocomplete.isOpen).toBeFalsy(
            "options panel did not close"
        );
    });

    it("should open options in input click", () => {
        fixture.detectChanges();
        component.options = testStringOptions;
        fixture.detectChanges();
        click(el);
        fixture.detectChanges();
        expect(el.query(css(".mat-autocomplete-panel"))).toBeTruthy(
            "options panel did not open"
        );
        component.toggle(ButtonClickEvents.left as any);
        click(el);
        fixture.detectChanges();
        expect(el.query(css(".mat-autocomplete-panel"))).toBeTruthy(
            "options panel did not open"
        );
    });

    it("should show loading", fakeAsync(() => {
        component.filterWith = (str: string) =>
            of(testStringOptions).pipe(
                delay(5000)
            );
        fixture.detectChanges();
        tick(component.searchWait);
        component.toggle(ButtonClickEvents.left as any);
        fixture.detectChanges();
        tick(500);
        expect(el.query(css(".is-loading"))).toBeTruthy(
            "Did not show loading option"
        );
        discardPeriodicTasks();
    }));

    // START WITH
    it("should start with option starting with 'f'", fakeAsync(() => {
        component.options = testStringOptions;
        component.startWith = "f";
        fixture.detectChanges();
        expect(component.options).toEqual(
            testStringOptions,
            "Options were not set correctly"
        );
        expect(component.startWith).toBe("f");

        const filtered = testStringOptions.filter((w) =>
            w.startsWith(component.startWith)
        );
        component.filterWith(component.startWith).subscribe((ops) => {
            expect(ops).toEqual(
                filtered,
                `FilterWith did not filter value start with letter 'f' as expected, expected[${filtered.join(
                    " "
                )}], got: [${ops.join(" ")}]`
            );
        });
        tick(1000);
    }));

    // IS EMPTY OPTION FIRST
    it("should make empty option first", () => {
        component.isEmptyOptionFirst = true;
        expect(component.isEmptyOptionFirst).toBe(true);
    });

    // DISABLED
    it("should set disabled", () => {
        component.disabled = true;
        expect(component.disabled).toBe(true);
    });

    // REQUIRED
    it("should set required", () => {
        component.required = true;
        expect(component.required).toBe(true);
    });

    // PLACEHOLDER
    it("should set placeholder", () => {
        const placeholder = "place";
        component.placeholder = placeholder;
        expect(component.placeholder).toBe(
            placeholder,
            `Placeholder expect: ${placeholder}, got ${component.placeholder}`
        );
    });

    // OPTIONS
    it("should set options", () => {
        [[], "", null, undefined, {}].forEach((v) => {
            component.options = v as any;
            expect(component.options).toEqual(
                [],
                `Options expect: ${v}, got: ${component.options}`
            );
        });

        component.options = testStringOptions;
        expect(component.options).toEqual(testStringOptions);
    });

    // VALUE
    it("should set value", () => {
        ["name", "", null, undefined].forEach((value) => {
            component.value = value;
            expect(component.value).toBe(
                value,
                `Value expect: ${value}, got: ${component.value}`
            );
            expect(component.searchField.value).toBe(
                value,
                `SearchField expect: ${value}, got: ${component.searchField.value}`
            );
        });
    });

    // SET DESCRIBED BY ID
    it("should join ids with space", () => {
        const ids = ["1", "2", "3"];
        component.setDescribedByIds(ids);
        expect(component.describedBy).toBe(ids.join(" "));
    });

    // SELECT
    it("should set new value", () => {
        const event = { option: { value: "name" } } as any;
        const onChangeSpy = jasmine.createSpy("onChange");
        component.registerOnChange(onChangeSpy);
        component.select(event);
        fixture.detectChanges();
        expect(component.value).toBe("name", "Value was not set");
        expect(onChangeSpy).toHaveBeenCalledTimes(1);

        event.option.value = undefined;
        component.filterWith = jasmine.createSpy("filterWith");
        component.select(event);
        fixture.detectChanges();

        expect(component.value).toBe(null);
        expect(component.searchField.value).toBe(null);
        expect(component.filterWith).toHaveBeenCalledTimes(1);
        expect(onChangeSpy).toHaveBeenCalledTimes(2);
    });

    // ON CONTAINER CLICK
    it("should focus into an input on container click", () => {
        spyOn(input.nativeElement, "focus");
        let event = new MouseEvent("left");
        event = {
            ...event,
            target: { ...event.target, ...{ tagName: "Host" } },
        };
        component.onContainerClick(event);
        expect(input.nativeElement.focus).toHaveBeenCalled();
    });

    // WRITE VALUE
    it("should set new value", () => {
        const testString = "string";
        component.writeValue(testString);
        expect(component.value).toBe(
            testString,
            `Write value: expected: ${testString}, got: ${component.value}`
        );
    });

    afterEach(()=> {
        component.ngOnDestroy();
    })
});

const defaultButtonEvent = {
    button: 0,
    preventDefault: () => {},
    stopPropagation: () => {},
};
const ButtonClickEvents = {
    left: { ...defaultButtonEvent, button: 0 },
    right: { ...defaultButtonEvent, button: 2 },
};

function click(
    el: DebugElement | HTMLElement,
    eventObj: any = ButtonClickEvents.left
): void {
    if (el instanceof HTMLElement) {
        el.click();
        return;
    }
    el.triggerEventHandler("click", eventObj);
}

function extract<T, K extends keyof T>(obj: T, ...keys: K[]) {
    return keys.reduce((acc, key) => ({ ...acc, [key]: obj[key] }), {});
}

interface GenericObj<T = any> {
    [key: string]: T;
}

export interface KeyValue {
    key: string;
    value: string;
}

@Component({
    template: `
        <mat-form-field>
            <mat-label *ngIf="label">{{ label }}</mat-label>
            <pgl-search-select
                [formControl]="testControl"
                [options]="optionList1$ | async"
            >
            </pgl-search-select>
            <mat-error>{{ error }}</mat-error>
            <mat-hint>{{ hint }}</mat-hint>
        </mat-form-field>
    `,
})
export class TestComponent {
    label = "";
    error = "Error";
    hint = "hint";
    testControl = new UntypedFormControl(null, Validators.required);
    optionList1$: Observable<string[]>;
    @ViewChild(PGLSearchSelectComponent) searchSelect: PGLSearchSelectComponent<
        any
    >;
    constructor() {}

    filterWith2(val: KeyValue | string): Observable<any[]> {
        return of(testStringOptions).pipe(
            randomDelay(3000),
            map((list: any[]) =>
                !val ? list : list.filter((item) => item.key.includes(val))
            )
        );
    }

    valueWith2(o: KeyValue): string {
        return o ? o.value : null;
    }
    displayWith2(o: KeyValue): string {
        return o ? o.key : "";
    }
}

function randomDelay(c: number) {
    return delay(Math.random() * c);
}
