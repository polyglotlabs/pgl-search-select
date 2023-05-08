import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { delay, tap } from "rxjs/operators";

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
        ]).pipe(tap(_ => console.log("getObjectList")), this.randomDelay(3000)) as Observable<KeyValue[]>;
    }

    randomDelay(c: number) {
        return delay(Math.random() * c);
    }
}
