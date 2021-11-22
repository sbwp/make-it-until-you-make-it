"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.from = exports.of = void 0;
const observable_1 = require("./observable");
function of(value) {
    return new observable_1.Observable(observer => {
        observer.next?.(value);
        observer.complete?.();
    });
}
exports.of = of;
function isIterable(candidate) {
    return typeof candidate?.[Symbol.iterator] === 'function';
}
function isFunction(candidate) {
    return typeof candidate === 'function';
}
function from(input) {
    let iterableCandidate = isFunction(input) ? input() : input; // If generator is provided, extract the iterator.
    if (isIterable(iterableCandidate)) {
        // Either input is iterable (array or Iterable) or generator provided an iterator
        return new observable_1.Observable(observer => {
            for (const value of iterableCandidate) {
                observer.next?.(value);
            }
            observer.complete?.();
        });
    }
    else {
        // Then we must have a promise due to process of elimination, so ensure it is definitely a promise:
        const definitelyAPromise = Promise.resolve(input);
        return new observable_1.Observable(observer => {
            definitelyAPromise.then(value => {
                observer.next?.(value);
                observer.complete?.();
            }, observer.error);
        });
    }
}
exports.from = from;
