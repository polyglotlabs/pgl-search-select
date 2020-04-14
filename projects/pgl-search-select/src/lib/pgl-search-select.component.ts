import {
    Component,
    OnInit,
    ElementRef,
    AfterViewInit,
    OnDestroy,
    DoCheck,
    Input,
    HostBinding,
    Output,
    EventEmitter,
    ViewChild,
    TemplateRef,
    Directive,
    Optional,
    Self,
    ContentChild,
    Inject,
    Host,
    HostListener,
} from "@angular/core";
import { FormControl, ControlValueAccessor, NgControl } from "@angular/forms";
import {
    MatFormFieldControl,
    MAT_FORM_FIELD,
    MatFormField,
} from "@angular/material/form-field";
import {
    MatAutocompleteOrigin,
    MatAutocompleteTrigger,
} from "@angular/material/autocomplete";
import { FocusMonitor } from "@angular/cdk/a11y";
import {
    coerceBooleanProperty,
    coerceNumberProperty,
} from "@angular/cdk/coercion";
import { Subject, Observable, of, from, merge, iif, OperatorFunction } from "rxjs";
import {
    filter,
    takeUntil,
    switchMap,
    toArray,
    debounceTime,
    distinctUntilChanged,
    shareReplay,
    share,
    mapTo,
    startWith,
    tap,
} from "rxjs/operators";
import { isObject } from "util";
import { Logger } from "projects/pgl-search-select-tester/src/app/common/log/log.class";

interface GenericObj<T = any> {
    [key: string]: T;
}

type AnyFunction = (...args: any[]) => any;

@Directive({
    selector: "[pglOptionDef]",
})
export class PGLOptionDef {}

@Directive({
    selector: "[pglEmptyOptionDef]",
})
export class PGLEmptyOptionDef {}

@Directive({
    selector: "[pglLoadingOptionDef]",
})
export class PGLLoadingOptionDef {}

export function optionalStartWith<T, D>(str: D): OperatorFunction<T, T | D> {
    Logger.Debug(`optionalStartWith: ${str}`);
    return (source: Observable<T>) => coerceBooleanProperty(str) ? source.pipe(startWith(str)) : source;
}

@Component({
    selector: "pgl-search-select",
    template: `
        <input
            [placeholder]="!hidePlaceholder ? placeholder : ''"
            #autoCompleteInput
            [matAutocomplete]="listOptions"
            [formControl]="searchField"
            [matAutocompleteConnectedTo]="host"
        />
        <div class="open-button">
            <button
                matSuffix
                tabindex="-1"
                mat-icon-button
                (click)="toggle($event, listOptions)"
            >
                <mat-icon>{{
                    !listOptions.isOpen ? buttons.open : buttons.close
                }}</mat-icon>
            </button>
        </div>

        <mat-autocomplete
            #listOptions="matAutocomplete"
            class="dropdown-panel-custom"
            (optionSelected)="select($event)"
            [autoActiveFirstOption]="autoActiveFirstOption"
            [displayWith]="displayWith"
        >
            <ng-container *ngIf="isLoading$ | async; else list">
                <mat-option class="is-loading">
                    <ng-container
                        *ngTemplateOutlet="
                            loadingOptionDef
                                ? loadingOptionDef
                                : defaultLoadingOption
                        "
                    ></ng-container>
                </mat-option>
            </ng-container>

            <ng-template #list>
                <ng-container *ngIf="options$ | async as ops">
                    <ng-container *ngTemplateOutlet="emptyOptionDef && isEmptyOptionFirst ? emptyOptionDef : false"></ng-container>
                    <!-- <mat-option>
                        <ng-container
                            *ngTemplateOutlet="emptyOptionDef"
                        ></ng-container>
                    </mat-option> -->
                    <mat-option *ngFor="let option of ops" [value]="option">
                        <ng-container
                            *ngTemplateOutlet="
                                optionDef ? optionDef : defaultOption;
                                context: { $implicit: option }
                            "
                        ></ng-container>
                    </mat-option>

                    <ng-container *ngTemplateOutlet="emptyOptionDef && !isEmptyOptionFirst ? emptyOptionDef : false"></ng-container>
                    <!-- <mat-option *ngIf="emptyOptionDef">
                        <ng-container
                            *ngTemplateOutlet="emptyOptionDef"
                        ></ng-container>
                    </mat-option> -->
                </ng-container>
            </ng-template>

            <ng-template #defaultOption let-option>
                {{ displayWith(option) }}
            </ng-template>

            <ng-template #defaultLoadingOption>
                <mat-progress-bar mode="query"></mat-progress-bar>
            </ng-template>
        </mat-autocomplete>
    `,
    styles: [
        `
            input {
                border: none;
                background: none;
                padding: 0;
                outline: none;
                font: inherit;
                flex: 1;
                width: 100%;
                max-width: 100%;
                vertical-align: bottom;
                text-align: inherit;
            }
            span {
                opacity: 0;
                transition: opacity 200ms;
            }
            button {
                align-self: center;
                width: 30px;
                height: 30px;
                line-height: 30px;
                border-radius: 10%;
            }
            :host.floating span {
                opacity: 1;
            }

            input::-webkit-outer-spin-button,
            input::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }

            :host {
                display: flex;
                flex-direction: row;
                align-items: center;
                vertical-align: bottom;
                margin-bottom: -0.2em;
                margin-top: -0.0625em;
            }
            .open-button {
                white-space: nowrap;
                flex: none;
                position: relative;
            }
            .open-button button {
                font: inherit;
                vertical-align: baseline;
                height: 1.5em;
                width: 1.5em;
            }
            .open-button .mat-icon-button .mat-icon {
                height: 1.125em;
                line-height: 1.125em;
            }
        `,
    ],
    providers: [
        { provide: MatFormFieldControl, useExisting: PGLSearchSelectComponent },
    ],
})
export class PGLSearchSelectComponent<T>
    implements
        AfterViewInit,
        MatFormFieldControl<T>,
        ControlValueAccessor,
        OnDestroy,
        MatAutocompleteOrigin {
    // STATIC
    static nextID = 0;

    // PRIVATE
    private _options: T[];
    private _value: T;
    private _placeholder: string;

    // private _tabindex = 0;
    private _disabled = false;
    private _required = false;
    private _displayLoading = true;
    private _isEmptyOptionFirst = false;
    private _destroyed$ = new Subject<void>();
    private _searchTrigger$: Observable<string>;
    private _startWith = "";

    private _onChange: AnyFunction = (..._: any[]) => {
        console.error("onChange is not set");
    };
    private _onTouched: AnyFunction = (..._: any[]) => {
        console.error("onTouch is not set");
    };

    // PUBLIC
    public searchField = new FormControl("");
    public stateChanges = new Subject<void>();
    public controlType = "pgl-search-select";
    public focused = false;
    public isLoading = true;
    public isLoading$: Observable<boolean>;
    public options$: Observable<T[]>;
    public autofilled?: boolean;

    // GETTER AND SETTERS
    get empty(): boolean {
        return !coerceBooleanProperty(this._value);
    }

    get errorState(): boolean {
        return (
            this.ngControl &&
            this.ngControl.errors !== null &&
            this.ngControl.touched &&
            this.searchField.dirty
        );
    }

    get host(): MatAutocompleteOrigin {
        return this;
    }

    get hidePlaceholder(): boolean {
        return this._formField._hideControlPlaceholder();
    }

    @Input()
    get displayLoading(): boolean {
        return this._displayLoading;
    }
    set displayLoading(val: boolean) {
        this._displayLoading = coerceBooleanProperty(val);
        this._stateChanged();
    }

    // OPTIONS
    @Input()
    get options(): T[] {
        return this._options;
    }
    set options(op: T[]) {
        console.log(`setting options: `, op);
        this._options = op;
        this.options$ = of(op);
        this._stateChanged();
    }

    // DISABLED
    @Input()
    get disabled(): boolean {
        return this._disabled;
    }
    set disabled(dis: boolean) {
        this._disabled = coerceBooleanProperty(dis);
        this._stateChanged();
    }

    // REQUIRED
    @Input()
    get required(): boolean {
        return this._required;
    }
    set required(req: boolean) {
        this._required = coerceBooleanProperty(req);
        this._stateChanged();
    }

    // PLACEHOLDER
    @Input()
    get placeholder(): string {
        return this._placeholder;
    }
    set placeholder(plh: string) {
        this._placeholder = plh;
        this._stateChanged();
    }

    // VALUE
    @Input()
    get value(): T {
        return this._value;
    }

    set value(val: T) {
        console.log(`setting value: ${val}`);
        this._value = val;
        this.searchField.setValue(this._value);
        this._stateChanged();
        this._onChange(this._value);
    }

    // Buttons
    @Input() buttons: {
        close: string;
        open: string;
    } = {
        close: "arrow_drop_up",
        open: "arrow_drop_down",
    };
    @Input('pglEmptyOptionFirst')
    get isEmptyOptionFirst(): boolean {
        return this._isEmptyOptionFirst;
    }
    set isEmptyOptionFirst(val: boolean) {
        this._isEmptyOptionFirst = coerceBooleanProperty(val);
    }

    // DISPLAY FN
    @Input() displayWith = (item: string | T) => `${item || ""}`;
    // VALUE FN
    @Input() valueWith: (item: T) => T = (item: T) => item;
    // FILTER WITH FN
    @Input() filterWith = (val: string) =>
        !val
            ? of(this.options)
            : from(this.options || []).pipe(
                  filter((o) => this.displayWith(o).startsWith(val)),
                  toArray()
              );
    @Input() searchWait = 500;
    @Input() autoActiveFirstOption = false;

    @Output() onSelect = new EventEmitter<T>();
    @Output() onFilter = new EventEmitter<string>();

    // START WITH
    @Input()
    get startWith(): string {
        return this._startWith;
    }
    set startWith(value: string) {
        this._startWith = value;
    }

    // HOSTBINDING
    @HostBinding("class.floating")
    get shouldLabelFloat() {
        return this.focused || !this.empty || !!this.searchField.value;
    }
    @HostBinding() id = `${
        this.controlType
    }-${PGLSearchSelectComponent.nextID++}`;
    @HostBinding("attr.aria-describedby") describedBy = "";

    @HostListener("click", ["$event"])
    onClick(_) {
        if (this.autoComplete && !this.autoComplete.autocomplete.isOpen) {
            this.autoComplete.openPanel();
        }
    }
    // VIEW CHILD
    @ViewChild("autoCompleteInput", { read: MatAutocompleteTrigger })
    autoComplete: MatAutocompleteTrigger;

    // CONTENT CHILD
    @ContentChild(PGLOptionDef, { read: TemplateRef })
    optionDef: PGLOptionDef;
    @ContentChild(PGLEmptyOptionDef, {read: TemplateRef })
    emptyOptionDef: PGLEmptyOptionDef;
    @ContentChild(PGLOptionDef, { read: TemplateRef })
    loadingOptionDef: PGLLoadingOptionDef;

    constructor(
        private _fm: FocusMonitor,
        public elementRef: ElementRef<HTMLElement>,
        @Optional()
        @Inject(MAT_FORM_FIELD)
        @Host()
        private _formField: MatFormField,
        @Optional() @Self() public ngControl: NgControl
    ) {
        this._fm
            .monitor(this.elementRef.nativeElement, true)
            .subscribe((origin) => {
                this.focused = !!origin;
                if (!this.ngControl.touched) {
                    this.ngControl.control.markAsTouched();
                }
                if (!this.focused && this.searchField.value != this._value) {
                    this.searchField.patchValue(this.value, {
                        emitEvent: false,
                    });
                }
            });
        if (this.ngControl != null) {
            this.ngControl.valueAccessor = this;
        }
    }

    setDescribedByIds(ids: string[]): void {
        this.describedBy = ids.join(" ");
    }

    ngAfterViewInit(): void {
        console.log(`....after View init: fired...`, this.emptyOptionDef, this.isEmptyOptionFirst)
        this._searchTrigger$ = this.searchField.valueChanges.pipe(
            tap((val) => console.log(val)),
            filter((val) => typeof val == "string"),
            optionalStartWith(this.startWith),
            distinctUntilChanged(),
            debounceTime(this.searchWait),
            shareReplay(1),
            tap((val) => console.log(`search trigger`, val))
        );
        this.options$ = this._searchTrigger$.pipe(
            switchMap(this.filterWith),
            shareReplay(1),
            takeUntil(this._destroyed$),
            tap((val) => console.log(`options `, val))
        );
        this.isLoading$ = merge(
            this._searchTrigger$.pipe(mapTo(this.displayLoading)),
            this.options$.pipe(mapTo(false))
        ).pipe(tap((val) => console.log(`isLoading; ${val}`)));
    }

    ngOnDestroy(): void {
        this._fm.stopMonitoring(this.elementRef);
        this._destroyed$.next();
        this._destroyed$.complete();
    }

    // PRIVATE METHODS
    private _stateChanged(): void {
        this.stateChanges.next();
    }

    // PUBLIC METHODS

    toggle(e, obj) {
        e.preventDefault();
        e.stopPropagation();
        if (obj.isOpen) {
            this.autoComplete.closePanel();
            return;
        }
        this.autoComplete.openPanel();
    }
    select(e) {
        if (e.option.value == undefined) {
            e.option.value = null;
            this.searchField.patchValue(null);
            this.options$ = this.filterWith(this.startWith);
        }
        this._value = e.option.value;
        this._onChange(this._value);
        this.onSelect.emit(this._value);
    }

    onContainerClick(event: MouseEvent) {
        // console.log(event.target as Element);
        if ((event.target as Element).tagName.toLowerCase() !== "input") {
            const input = this.elementRef.nativeElement.querySelector("input");
            if (input) {
                input.focus();
            }
        }
    }

    // ControlValueAccessor methods
    /**
     *
     */
    writeValue(v: T): void {
        console.log(`writing value: ${v}`);
        if (!v) {
            return;
        }
        this.value = v;
    }
    registerOnChange(fn: (...any: any[]) => any): void {
        this._onChange = fn;
    }
    registerOnTouched(fn: (...args: any[]) => any): void {
        this._onTouched = fn;
    }
    setDisabledState?(_: boolean): void {
        console.log("not set");
    }
}
