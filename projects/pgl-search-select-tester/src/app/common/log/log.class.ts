/* eslint-disable no-fallthrough */
import { tap } from "rxjs/operators";
// import { isObject } from "util";

export enum LogLevel {
    INFO,
    DEBUG,
    WARNING,
    ERROR,
    OFF,
}

export interface Logable {
    log: typeof log;
}

export class LogCache {
    private _value: any[] = [];
    push(value): void {
        this._value.push(value);
    }
    indexOf(value): number {
        return this._value.indexOf(value);
    }
}
const EmptyFunction = (...args: any[]): void => undefined;
//@dynamic
// eslint-disable-next-line @typescript-eslint/class-name-casing
export class log {
    private static _cache = new Map<LogLevel, typeof log>();
    static hideInDev = false;
    // static show = !log.hideInDev && !environment.production;
    static show = !log.hideInDev;
    static Info = log.show ? console.info : EmptyFunction;
    static Debug = log.show ? console.log : EmptyFunction;
    static Warn = log.show ? console.warn : EmptyFunction;
    static Error = log.show ? console.error : EmptyFunction;
    static Assert = log.show ? console.assert : EmptyFunction;
    static Group = log.show ? console.group : EmptyFunction;
    static GroupEnd = log.show ? console.groupEnd : EmptyFunction;
    static Tap(message: string, thisArg?) {
        return tap({
            next: (val) => log.Debug(`NEXT: ${message}`, val, thisArg ? thisArg : ''),
            error: (err) => log.Error(`ERROR: ${message}`, err, thisArg ? thisArg : ''),
            complete: () => log.Debug(`COMPLETE: ${message}`, thisArg ? thisArg : ''),
        });
    }

    static InTemplate = (val: any): any => {
        let cache = new LogCache();
        const striped = JSON.parse(JSON.stringify(val, log.replacerFn(cache)));
        cache = null;
        return striped;
    };
    static jsonSafeObj(obj, depth = 0) {
        let visited = new LogCache();
        return log._getValues(obj, visited, depth);
    }

    private static _getValues(source: any, visited: LogCache, depth: number) {
        if (source != null && typeof source == 'object') {
            if(depth < 0 || visited.indexOf(source) > -1) return null
            
            visited.push(source);
            if (Array.isArray(source)) {
                return source.map((item) =>
                    this._getValues(item, visited, depth - 1)
                );
            }

            return Object.keys(source).reduce(
                (acc, key) => ({
                    ...acc,
                    [key]: this._getValues(source[key], visited, depth - 1),
                }),
                {}
            );
        }
        

        return source;
    }

    static replacerFn(cache: LogCache) {
        return (_, value) => {
            if (typeof value === "object") {
                if (cache.indexOf(value) === -1) {
                    cache.push(value);
                    return value;
                }
                return null;
            }
            return value;
        };
    }

    static fromLevel(level: LogLevel): typeof log {
        if (log._cache.has(level)) {
            return log._cache.get(level);
        }

        const rt = {
            ...log,
            Error: log.Error,
            Assert: log.Assert,
            Info: log.Info,
            Warn: log.Warn,
            Debug: log.Debug,
        } as typeof log;
        switch (level) {
            case LogLevel.OFF:
                rt.Error = EmptyFunction;
            case LogLevel.ERROR:
                rt.Warn = EmptyFunction;
            case LogLevel.WARNING:
                rt.Debug = EmptyFunction;
            case LogLevel.DEBUG:
                rt.Info = EmptyFunction;
            case LogLevel.INFO:
                break;
            default:
                console.error(`Uknown log level ${LogLevel[level]}`);
        }
        log._cache.set(level, rt);
        return rt;
    }
}

export class Logger extends log {}

// export class Logger {
//     private _names: string[];
//     public Debug = log.Debug;
//     public Error = log.Error;
//     public Assert = log.Assert;
//     public InTemplate = log.InTemplate;
//     private _group = log.Group;
//     private _groupEnd = log.GroupEnd;
//     get depth(): number {
//         return this._names.length;
//     }
//     constructor(name: string = ''){
//         this._names.push(name);
//         if(name != ''){
//             this._group(name);
//         }
//     }

//     group(name){
//         this._names.push(name);
//         this._group(name);
//     }

//     groupEnd(){
//         if(this.depth == 0){
//             return;
//         }
//         const name = this._names.pop();
//         this.Debug(`${name} ended`);
//         this._groupEnd();
//     }

//     end(){
//         if(this.depth == 0){
//             return;
//         }
//         while(this.depth > 0){
//             this.groupEnd();
//         }
//     }
// }

// http://tobyho.com/2012/07/27/taking-over-console-log/
// keeting this for reference
// please do not remove
// -- Gene
// function takeOverConsole(){
//     var console = window.console
//     if (!console) return
//     function intercept(method){
//         var original = console[method]
//         console[method] = function(){
//             // do sneaky stuff
//             if (original.apply){
//                 // Do this for normal browsers
//                 original.apply(console, arguments)
//             }else{
//                 // Do this for IE
//                 var message = Array.prototype.slice.apply(arguments).join(' ')
//                 original(message)
//             }
//         }
//     }
//     var methods = ['log', 'warn', 'error']
//     for (var i = 0; i < methods.length; i++)
//         intercept(methods[i])
// }
