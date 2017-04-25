const originalCatch = Promise.prototype.catch;

Object.assign(Promise.prototype, {
    finally<T>(this: Promise<T>, handler: () => any): Promise<T> {
        return this
            .tap(value => Promise.resolve(handler()).return(value))
            .catch(err => Promise.resolve(handler()).throw(err));
    },

    catch<T>(this: Promise<T>, errorCls: Function, onReject: (error: any) => T | Promise<T>): Promise<T> {
        let predicate: (err: any) => boolean;
        if (errorCls === Error || (errorCls.prototype instanceof Error)) { // Error constructor as predicate
            predicate = err => err instanceof errorCls;
        } else if (onReject) { // Got two functions, handmade predicate
            predicate = <any> errorCls;
        } else { // A "standard", predicate-less catch.
            return originalCatch.call(this, errorCls);
        }

        return originalCatch.call(this, (err: Error) => {
            if (!predicate(err)) {
                throw err;
            }

            return onReject(err);
        });
    },

    tap<T>(this: Promise<T>, handler: (result: T) => any): Promise<T> {
        return this.then(value => Promise.resolve(handler(value)).return(value));
    },

    return<T, U>(this: Promise<T>, value: U): Promise<U> {
        return this.then(() => value);
    },

    throw<T>(this: Promise<T>, err: any): Promise<never> {
        return this.then(() => { throw err; });
    },

    map<T, R>(this: Promise<T[]>, iterator: (item: T, index: number) => R | PromiseLike<R>): Promise<R[]> {
        return this.then(items => Promise.map(items, iterator));
    },
});

Object.assign(Promise, {
    map<T, R>(items: T[], iterator: (item: T, index: number) => R | PromiseLike<R>): Promise<R[]> {
        if (!Array.isArray(items)) {
            throw new Error(`Expected array in Promise.map, Got: ${items}`);
        }

        const promises: (R | PromiseLike<R>)[] = new Array(items.length);
        for (let i = 0; i < items.length; i++) {
            promises[i] = iterator(items[i], i);
        }

        return Promise.all(promises);
    },
});
