import {
    CompleteFunction,
    ErrorFunction,
    isPartialObserver,
    NextFunction,
    Observer,
    PartialObserver
} from './observer';
import { noOp, Observable } from './observable';
import { Subscription } from './subscription';

export class Subject<T> extends Observable<T> implements Observer<T> {
    private downstreamObservers: Observer<T>[] = [];
    protected isComplete: boolean = false;
    protected isError: boolean = false;
    protected thrownError: any = undefined;

    constructor() {
        super(observer => {
            this.downstreamObservers.push(observer);
        });
    }

    // The "next", "error", and "complete" handlers must be arrow functions to preserve "this"
    public next = (value: T) => {
        this.doNext(value);
    }

    public error = (error?: any) => {
        if (this.isComplete || this.isError) {
            return;
        }

        this.isError = true;
        this.thrownError = error;
        for (const observer of this.downstreamObservers) {
            observer.error(error);
        }
    }

    public complete = () => {
        if (this.isComplete || this.isError) {
            return;
        }

        this.isComplete = true;
        for (const observer of this.downstreamObservers) {
            observer.complete();
        }
    }

    public asObservable(): Observable<T> {
        return new Observable<T>(observer => this.behavior(observer));
    }

    public subscribe(observerOrNext: PartialObserver<T> | NextFunction<T>, error?: ErrorFunction, complete?: CompleteFunction): Subscription {
        if (this.isComplete) {
            isPartialObserver<T>(observerOrNext) ? observerOrNext.complete?.() : complete?.();
            return new Subscription(noOp);
        } else if (this.isError) {
            isPartialObserver<T>(observerOrNext) ? observerOrNext.error?.(this.thrownError) : error?.(this.thrownError);
            return new Subscription(noOp);
        } else {
            return super.subscribe(observerOrNext as NextFunction<T>, error, complete);
        }
    }

    protected doNext(value: T): void {
        if (this.isComplete || this.isError) {
            return;
        }

        for (const observer of this.downstreamObservers) {
            observer.next(value);
        }
    }
}
