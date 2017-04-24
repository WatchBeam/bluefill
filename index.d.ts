interface Promise<T> {
    /**
     * Pass a handler that will be called regardless of this promise's fate.
     * Returns a new promise chained from this promise. There are special
     * semantics for .finally in that the final value cannot be modified
     * from the handler.
     *
     * @see http://bluebirdjs.com/docs/api/finally.html
     */
    finally(handler: () => any): Promise<T>;

    /**
     * This is an extension to .catch to work more like catch-clauses in
     * languages like Java or C#. Instead of manually checking instanceof or
     * .name === "SomeError", you may specify a number of error constructors
     * which are eligible for this catch handler. The catch handler that is
     * first met that has eligible constructors specified, is the one that
     * will be called.
     *
     * @see http://bluebirdjs.com/docs/api/catch.html
     */
    catch<U>(predicate: (err: any) => boolean, onReject: (err: any) => U | PromiseLike<U>): Promise<U | T>;
    catch<E extends Error, U>(errorCls: { new(...args: any[]): E }, onReject: (error: E) => U | PromiseLike<U>): Promise<U | T>;
    catch<E extends Error>(errorCls: { new(...args: any[]): E }, onReject: (error: E) => T | PromiseLike<T> | void | PromiseLike<void>): Promise<T>;

    /**
     * tap is called with the result of the previously-resolved promise. It
     * can inspect the result and run logic, possibly returning a promise,
     * but the result will not be modified.
     */
    tap(handler: (result: T) => any): Promise<T>;

    /**
     * Takes an array of items from the previous promise, running the iterator
     * function over all of them with maximal concurrency.
     */
    map<U, R>(iterator: (item: U, index: number) => R | PromiseLike<R>): Promise<R[]>;

    /**
     * Convenience method for .then(() => value);
     * @see http://bluebirdjs.com/docs/api/return.html
     */
    return<R>(value: R): Promise<R>;

    /**
     * Convenience method for .then(() => { throw value; });
     * @see http://bluebirdjs.com/docs/api/throw.html
     */
    throw(value: any): Promise<never>;
}

interface PromiseConstructor {
    /**
     * 'static' implementation of `Promise.map`
     */
    map<T, R>(items: T[], iterator: (item: T, index: number) => R | PromiseLike<R>): Promise<R[]>;
}
