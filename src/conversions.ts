import { Observable } from './observable';

type AnyFunction = (...x: any[]) => any;

export function of<T>(value: T): Observable<T> {
    return new Observable<T>(observer => {
        observer.next?.(value);
        observer.complete?.();
    });
}

function isIterable<T = any>(candidate: any): candidate is Iterable<T> {
    return typeof candidate?.[Symbol.iterator] === 'function';
}

function isFunction(candidate: any): candidate is AnyFunction {
    return typeof candidate === 'function';
}

export function from<T>(array: T[]): Observable<T>;
export function from<T>(promise: Promise<T>): Observable<T>;
export function from<T>(iterable: Iterable<T>): Observable<T>;
export function from<T>(generator: Generator<T>): Observable<T>;
export function from<T>(input: T[] | Promise<T> | Iterable<T> | Generator<T>): Observable<T> {
    let iterableCandidate = isFunction(input) ? input() : input; // If generator is provided, extract the iterator.
    if (isIterable<T>(iterableCandidate)) {
        // Either input is iterable (array or Iterable) or generator provided an iterator
        return new Observable<T>(observer => {
            for (const value of iterableCandidate) {
                observer.next?.(value);
            }
            observer.complete?.();
        });
    } else {
        // Then we must have a promise due to process of elimination, so ensure it is definitely a promise:
        const definitelyAPromise: Promise<T> = Promise.resolve(input as Promise<T>);
        return new Observable<T>(observer => {
            definitelyAPromise.then( value => {
                observer.next?.(value)
                observer.complete?.()
            }, observer.error);
        });
    }

}
