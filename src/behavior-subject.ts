import { Subject } from './subject';
import { CompleteFunction, ErrorFunction, isPartialObserver, NextFunction, PartialObserver } from './observer';
import { Subscription } from './subscription';
import { ReplaySubject } from './replay-subject';

export class BehaviorSubject<T> extends Subject<T> {
    private currentValue: T;

    public constructor(initialValue: T) {
        super();
        this.currentValue = initialValue;
    }

    public next = (value: T) => {
        this.doNext(value);
        this.currentValue = value;
    }

    public getValue(): T {
        return this.currentValue
    }

    public subscribe(observerOrNext: PartialObserver<T> | NextFunction<T>, error?: ErrorFunction, complete?: CompleteFunction): Subscription {
        // Emit current value when subscribing
        if (!this.isComplete && !this.isError) {
            isPartialObserver<T>(observerOrNext) ? observerOrNext.next?.(this.currentValue) : observerOrNext?.(this.currentValue);
        }

        return super.subscribe(observerOrNext, error, complete);
    }
}

export class BehaviorSubjectAltImpl<T> extends ReplaySubject<T> {

    public constructor(initialValue: T) {
        super(1);
        this.cache.push(initialValue);
    }

    public getValue(): T {
        return this.cache[0];
    }
}
