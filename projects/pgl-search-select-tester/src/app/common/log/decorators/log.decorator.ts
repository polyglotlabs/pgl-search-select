import { Logable } from '../log.class';
import { LogLevel, log } from '../log.class';

export function Log(level: LogLevel) {
    return function <T> (_: T, name: string, descriptor: PropertyDescriptor) : PropertyDescriptor{
        type params = Parameters<typeof descriptor.value>
        type rtrn = ReturnType<typeof descriptor.value>
        const method: (...args: params[])=> rtrn = descriptor.value;
        descriptor.value = function (...args: params[]): rtrn{
            if(!('log' in this)){
                return method.apply(this, args);
            }
            const self = this as Logable;
            const current = self.log;
            self.log = log.fromLevel(level)
            self.log.Info(`${name} method was fire...`)
            const v = method.apply(this, args);
            self.log.Info(`${name} method complete...`)
            self.log = current;
            return v;
        }
        return descriptor
    };
}
