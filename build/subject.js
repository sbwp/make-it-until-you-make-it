"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subject = void 0;
const observer_1 = require("./observer");
const observable_1 = require("./observable");
const subscription_1 = require("./subscription");
class Subject extends observable_1.Observable {
    constructor() {
        super(observer => {
            this.downstreamObservers.push(observer);
        });
        this.downstreamObservers = [];
        this.isComplete = false;
        this.isError = false;
        this.thrownError = undefined;
        // The "next", "error", and "complete" handlers must be arrow functions to preserve "this"
        this.next = (value) => {
            this.doNext(value);
        };
        this.error = (error) => {
            if (this.isComplete || this.isError) {
                return;
            }
            this.isError = true;
            this.thrownError = error;
            for (const observer of this.downstreamObservers) {
                observer.error(error);
            }
        };
        this.complete = () => {
            if (this.isComplete || this.isError) {
                return;
            }
            this.isComplete = true;
            for (const observer of this.downstreamObservers) {
                observer.complete();
            }
        };
    }
    asObservable() {
        return new observable_1.Observable(observer => this.behavior(observer));
    }
    subscribe(observerOrNext, error, complete) {
        if (this.isComplete) {
            observer_1.isPartialObserver(observerOrNext) ? observerOrNext.complete?.() : complete?.();
            return new subscription_1.Subscription(observable_1.noOp);
        }
        else if (this.isError) {
            observer_1.isPartialObserver(observerOrNext) ? observerOrNext.error?.(this.thrownError) : error?.(this.thrownError);
            return new subscription_1.Subscription(observable_1.noOp);
        }
        else {
            return super.subscribe(observerOrNext, error, complete);
        }
    }
    doNext(value) {
        if (this.isComplete || this.isError) {
            return;
        }
        for (const observer of this.downstreamObservers) {
            observer.next(value);
        }
    }
}
exports.Subject = Subject;
