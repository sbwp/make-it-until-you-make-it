import { Subject } from './subject';
import { CompleteFunction, ErrorFunction, isPartialObserver, NextFunction, PartialObserver } from './observer';
import { Subscription } from './subscription';

export class ReplaySubject<T> extends Subject<T> {
    protected cache: T[] = [];

    public constructor(private size: number) {
        super();
    }

    public next = (value: T) => {
        this.doNext(value);
        this.cache.push(value);
        this.cache = this.cache.slice(-5);
    }

    public subscribe(observerOrNext: PartialObserver<T> | NextFunction<T>, error?: ErrorFunction, complete?: CompleteFunction): Subscription {
        // Emit current value when subscribing
        if (!this.isComplete && !this.isError) {
            const nextFn: NextFunction<T> | undefined = isPartialObserver<T>(observerOrNext) ? observerOrNext.next : observerOrNext;
            if (nextFn) {
                this.cache.forEach(nextFn);
            }
        }

        return super.subscribe(observerOrNext, error, complete);
    }
}
