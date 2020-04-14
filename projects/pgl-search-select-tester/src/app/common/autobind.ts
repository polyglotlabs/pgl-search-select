
export function Autobind(_: any, _2: string, descriptor: PropertyDescriptor): PropertyDescriptor{
    const method = descriptor.value;
    return {
        configurable: true,
        enumerable: false,
        get() {
            return method.bind(this);
        }
    } as PropertyDescriptor
}