import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { AppService, KeyValue } from "./app.service";
import { Observable, Observer } from "rxjs";
import { map, shareReplay, tap } from "rxjs/operators";
import { Autobind } from "./common/autobind";
import { Logger } from "./common/log/log.class";

interface GenericObj<T = any> {
    [key: string]: T
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
    form: FormGroup
    optionList1$: Observable<string[]>;
    optionList3$: Observable<GenericObj[]>;
    searchSelect2 = new FormControl({
        key: "family",
        value: "indeed",
    }, Validators.required);
    searchSelect3 = new FormControl();
    constructor(private _as: AppService) {}

    ngOnInit(): void {
        this.searchSelect1.valueChanges.pipe(this.withIndex(1)).subscribe(this);
        this.searchSelect2.valueChanges.pipe(this.withIndex(2)).subscribe(this);
        this.searchSelect3.valueChanges.pipe(this.withIndex(3)).subscribe(this);
        this.form = new FormGroup({
            example1: this.searchSelect1
        })
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
        return this._as
            .getObjList()
            .pipe(
                map((list: any[]) =>
                    !val ? list : list.filter((item) => item.key.includes(val))
                ),
               tap(list => this.log.Debug(`filter value ${val}`, list))
            );
    }
    @Autobind
    callBack(e){
        console.log(e);
    }

    valueWith2(o: KeyValue): string {
        return o ? o.value : null;
    }
    displayWith2(o: KeyValue): string {
        return o ? o.key : "";
    }

    submit(){
        this.form.markAllAsTouched();
        this.searchSelect1.markAsTouched();
        console.log("submitted")
    }
}
