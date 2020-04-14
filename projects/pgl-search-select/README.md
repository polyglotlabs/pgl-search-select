# Search Select

## Usage

app.component.html

```html
<mat-form-field>
    <mat-label>Label</mat-label>
    <eye-simple-search-select
        [label]="'Key Field'"
        [placeholder]="'Search'"
        [options]="options"
        (onFilter)="onFilter($event)"
        (onSelect)="onSelect($event)"
    >
        <!-- the styling has be update by the user -->
        <!-- default `mat-option` does not support multi-line option -->
        <div *eyeOptionDef="let option" class="mat-list-option mat-2-line">
            <p class="mat-line">{{option}} randome stuff</p>
            <p class="mat-line">sub line info</p>
        </div>
    </eye-simple-search-select>
    <mat-error> error </mat-error>
    <mat-hint> hint </mat-hint>
</mat-form-field>
```

app.component.ts

```ts
import { Component } from "@angular/core";
import { Observable, of } from "rxjs";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.css"],
})
export class AppComponent {
    title = "Search Select examples";

    optionsObservable: Observable<any[]>;
    simpleSelectValue: any = null;

    select = ["item 1", "item 2", "item 3"];

    simpleSelect = this.select;

    selectObj = of([
        {
            name: "Item 1",
            value: 1,
        },
        {
            name: "Item 2",
            value: 2,
        },
        {
            name: "Item 3",
            value: 3,
        },
    ]);

    simpleSearchObj = this.selectObj;

    displayFn = (value: any) => {
        return Boolean(value) && typeof value == "object" ? value.name : value;
    };

    onFilter(event) {
        console.log(event);
        this.optionsObservable = of(
            this.simpleSelect.filter((item) => item.indexOf(event) == 0)
        );
    }

    onSelect(event) {
        console.log(event);
    }
}
```

app.module.ts

```ts
import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { SimpleSearchSelectModule } from "simple-search-select";

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        AppRoutingModule,
        SimpleSearchSelectModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
```

## Property list

```ts
@Input() placeholder: string
@Input() required: boolean
@Input() disabled: boolean
@Input() value: T | T[K]
@Input() displayFn: (_: string | T)=> string;
@Input() valueFn: (item: T) => T | T[K];
@Input() filterWith: (val: string)=> T[]
// @Input() classes: string | string[]
@Input() emptyValue: string
@Input() options: T[]
// @Input() startFilter: string
// @Input() useStartWith: boolean
@Input() searchWait: number;
@Output() onSelect: any;
@Output() onFilter: string
```
