import {
    CompleteFunction,
    ErrorFunction,
    isObserver,
    isPartialObserver,
    NextFunction,
    Observer,
    PartialObserver
} from './observer';
import { Subscription } from './subscription';

type ObservableBehavior<T> = (observer: Observer<T>) => void;
export const noOp = () => {};

export class Observable<T> {
    constructor(protected behavior: ObservableBehavior<T>) {}

    subscribe(observer: PartialObserver<T>): Subscription;
    subscribe(next: NextFunction<T>, error?: ErrorFunction, complete?: CompleteFunction): Subscription;
    subscribe(observerOrNext: PartialObserver<T> | NextFunction<T>, error?: ErrorFunction, complete?: CompleteFunction): Subscription {
        return this._subscribe(isPartialObserver<T>(observerOrNext) ? observerOrNext : { next: observerOrNext, error: error, complete: complete });
    }

    private _subscribe(observer: PartialObserver<T>): Subscription {
        const subscriptionObserver = {
            next: observer.next ?? noOp,
            error: observer.next ?? noOp,
            complete: observer.complete ?? noOp
        }

        const subscription = new Subscription(() => {
            subscriptionObserver.next = noOp;
            subscriptionObserver.error = noOp;
            subscriptionObserver.complete = noOp;
        });

        this.behavior(subscriptionObserver);
        return subscription;
    }
}
