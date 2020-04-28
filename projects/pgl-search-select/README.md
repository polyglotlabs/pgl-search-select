# Search Select

## Usage

app.component.html

```html
<mat-form-field>
    <mat-label>String List</mat-label>
    <pgl-search-select
        placeholder="search"
        [formControl]="searchSelect1"
        [options]="optionList1$ | async"
    >
    </pgl-search-select>
    <mat-error>Error</mat-error>
    <mat-hint>Hint</mat-hint>
</mat-form-field>
<br />
<mat-form-field>
    <mat-label>String List 2</mat-label>
    <pgl-search-select
        placeholder="search"
        [formControl]="searchSelect2"
        [filterWith]="filterWith2"
        [displayWith]="displayWith2"
        displayLoading="true"
    >
        <!-- the styling has be update by the user -->
        <!-- default `mat-option` does not support multi-line option -->
        <div *eyeOptionDef="let option" class="mat-list-option mat-2-line">
            <p class="mat-line">{{option}} random stuff</p>
            <p class="mat-line">sub line info</p>
        </div>
    </pgl-search-select>
</mat-form-field>
<br />
<mat-form-field>
    <mat-label>String List 3</mat-label>
    <pgl-search-select
        placeholder="search"
        [formControl]="searchSelect3"
        [options]="optionList3$ | async"
        [displayWith]="displayWith2"
        pglEmptyOptionFirst="true"
    >
        <ng-container *pglEmptyOptionDef>Clear</ng-container>
    </pgl-search-select>
</mat-form-field>
```

app.component.ts

```ts
import { Component, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { AppService, KeyValue } from "./app.service";
import { Observable, Observer } from "rxjs";
import { map, shareReplay } from "rxjs/operators";
import { Autobind } from "./common/autobind";
import { Logger } from "./common/log/log.class";

interface GenericObj<T = any> {
    [key: string]: T;
}

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit, Observer<any> {
    title = "pgl-search-select-tester";
    log = Logger;
    testInput = new FormControl();
    searchSelect1 = new FormControl(null, Validators.required);
    optionList1$: Observable<string[]>;
    optionList3$: Observable<GenericObj[]>;
    searchSelect2 = new FormControl(
        {
            key: "family",
            value: "indeed",
        },
        Validators.required
    );
    searchSelect3 = new FormControl();
    constructor(private _as: AppService) {}

    ngOnInit(): void {
        this.searchSelect1.valueChanges.pipe(this.withIndex(1)).subscribe(this);
        this.searchSelect2.valueChanges.pipe(this.withIndex(2)).subscribe(this);
        this.searchSelect3.valueChanges.pipe(this.withIndex(3)).subscribe(this);
        this.optionList1$ = this._as.getList().pipe(shareReplay(1));
        this.optionList3$ = this._as.getObjList().pipe(shareReplay(1));
    }
    @Autobind
    next([val, i]): void {
        this.log.Debug(`select ${i}: ${val}`);
    }
    @Autobind
    error([val, i]): void {
        this.log.Error(`select ${i}`, val);
    }
    @Autobind
    complete(): void {
        this.log.Warn(`select completed...`);
    }

    withIndex(index): any {
        return map((val) => [val, index]);
    }

    @Autobind
    filterWith2(val: KeyValue): Observable<any[]> {
        return this._as.getObjList().pipe(
            this.log.Tap(`filter value ${val}`),
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
```

app.service.ts

```ts
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { delay } from "rxjs/operators";

export interface KeyValue {
    key: string;
    value: string;
}

@Injectable({
    providedIn: "root",
})
export class AppService {
    getList(): Observable<string[]> {
        return of(["name", "smith", "dave", "file"]).pipe(
            this.randomDelay(3000)
        ) as Observable<string[]>;
    }

    getObjList(): Observable<KeyValue[]> {
        return of([
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
        ]).pipe(this.randomDelay(3000)) as Observable<KeyValue[]>;
    }

    randomDelay(c: number) {
        return delay(Math.random() * c);
    }
}

```

app.module.ts

```ts
import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppComponent } from "./app.component";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatOptionModule } from "@angular/material/core";
import { MatInputModule } from "@angular/material/input";
import { PglSearchSelectModule } from "projects/pgl-search-select/src/public-api";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ReactiveFormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatAutocompleteModule,
        MatFormFieldModule,
        MatOptionModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        PglSearchSelectModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
```

## Property list

```ts
@Input() placeholder: string;
@Input() required: boolean;
@Input() disabled: boolean;
@Input() value: T;
@Input() displayFn: (_: string | T)=> string;
@Input() filterWith: (val: string)=> Observable<T[]>;
@Input() options: T[];
@Input() startWith: string; // defautl ''. If null or undefined will bypass the initial filtering.
@Input() searchWait: number;
@Input() autoActiveFirstOption: boolean; // default: false;
@Input() displayLoading: boolean; // default: true;
@Input("pglEmptyOptionFirst") isEmptyOptionFirst: boolean; // default: false
@Output() onSelect: any;
@Output() onFilter: string;
```
