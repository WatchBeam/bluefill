const originalCatch = Promise.prototype.catch;

Object.assign(Promise.prototype, {
    finally<T>(this: Promise<T>, handler: (result?: T, error?: Error) => any): Promise<T> {
        return this
            .then(result => Promise.resolve(handler(result)).then(() => result))
            .catch(err => Promise.resolve(handler(undefined, err)).then(() => { throw err; }));
    },

    catch<T>(this: Promise<T>, errorCls: Function, onReject: (error: any) => T | Promise<T>): Promise<T> {
        if (errorCls !== Error && !(errorCls.prototype instanceof Error)) {
            return originalCatch.apply(this, arguments);
        }

        return originalCatch.call(this, (err: Error) => {
            if (!(err instanceof errorCls)) {
                throw err;
            }

            return onReject(err);
        });
    },

    tap<T>(this: Promise<T>, handler: (result: T) => any): Promise<T> {
        return this.then(result => {
            handler(result);
            return result;
        });
    },

    map<T, R>(this: Promise<T[]>, iterator: (item: T, index: number) => R | PromiseLike<R>): Promise<R[]> {
        return this.then(items => {
            if (!Array.isArray(items)) {
                throw new Error('Expected array of items to Promise.map (via ' +
                    `bluefill). Got: ${JSON.stringify(items)}`);
            }

            const promises: (R | PromiseLike<R>)[] = new Array(items.length);
            for (let i = 0; i < promises.length; i++) {
                promises[i] = iterator(items[i], i);
            }

            return Promise.all(promises);
        });
    },
});

Object.assign(Promise, {
    map<T, R>(items: T[], iterator: (item: T, index: number) => R | PromiseLike<R>): Promise<R[]> {
        return Promise.resolve(items).map(iterator);
    },
});
