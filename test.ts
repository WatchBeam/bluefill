import { expect, use } from 'chai';
import * as chap from 'chai-as-promised';

use(chap);

import './';

class FooError extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, FooError.prototype);
    }
}

class BarError extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, BarError.prototype);
    }
}

const ok = Symbol('promise result passed');

describe('Promise.catch', () => {
    it('does not interfere with normal catches', () => {
        const err = new FooError();
        return expect(
            Promise.reject(err).catch(e => {
                expect(e).to.equal(err);
                return ok;
            })
        ).to.eventually.equal(ok);
    });

    it('catches by class constructor', () => {
        const err = new FooError();
        return expect(
            Promise.reject(err).catch(FooError, e => {
                expect(e).to.equal(err);
                return ok;
            })
        ).to.eventually.equal(ok);
    });

    it('does not catch if the constructor is mismatched', () => {
        const err = new FooError();
        return expect(Promise.reject(err).catch(BarError, () => ok))
            .to.eventually.be.rejectedWith(err);
    });

    it('catches if the constructor is a parent class', () => {
        const err = new FooError();
        return expect(Promise.reject(err).catch(Error, () => ok))
            .to.eventually.equal(ok);
    });
});

describe('Promise.finally', () => {
    it('runs when promise is resolved', () => {
        let finallyCalled = false;
        return expect(
            Promise.resolve(ok).finally(() => finallyCalled = true)
        )
            .to.eventually.equal(ok)
            .then(() => expect(finallyCalled).to.be.true);
    });

    it('runs when promise is rejected', () => {
        let finallyCalled = false;
        const err = new FooError();
        return expect(
            Promise.reject(err).finally(() => finallyCalled = true)
        )
            .to.eventually.rejectedWith(err)
            .then(() => expect(finallyCalled).to.be.true);
    });
});

describe('Promise.tap', () => {
    it('intercepts and does modify result', () => {
        let tappedResult: number;
        return expect(
            Promise.resolve(2).tap(r => {
                tappedResult = r;
                return r * 2;
            })
        ).to.eventually.equal(2);
    });

    it('is skipped during a rejection', () => {
        const err = new FooError();
        return expect(
            Promise.reject(err).tap(() => {
                throw new Error('should not have been called');
            })
        ).to.eventually.be.rejectedWith(err);
    });
});

describe('Promise.map', () => {
    it('maps over items where values are returned', () => {
        return expect(
            Promise.resolve([1, 2, 3]).map((item: number) => item * 2)
        ).to.eventually.deep.equal([2, 4, 6]);
    });

    it('maps over items where promises are returned', () => {
        return expect(
            Promise.resolve([1, 2, 3]).map((item: number) => Promise.resolve(item * 2))
        ).to.eventually.deep.equal([2, 4, 6]);
    });

    it('(static) maps over items where values are returned', () => {
        return expect(
            Promise.map([1, 2, 3], item => item * 2)
        ).to.eventually.deep.equal([2, 4, 6]);
    });

    it('(static) maps over items where promises are returned', () => {
        return expect(
            Promise.map([1, 2, 3], item => Promise.resolve(item * 2))
        ).to.eventually.deep.equal([2, 4, 6]);
    });

    it('throws if a non-array is provided', () => {
        return expect(
            Promise.resolve('wut').map((item: number) => item * 2)
        ).to.eventually.rejectedWith(/Expected array of items/);
    });
});
