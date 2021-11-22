"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Observable = exports.noOp = void 0;
const observer_1 = require("./observer");
const subscription_1 = require("./subscription");
exports.noOp = () => { };
class Observable {
    constructor(behavior) {
        this.behavior = behavior;
    }
    subscribe(observerOrNext, error, complete) {
        return this._subscribe(observer_1.isPartialObserver(observerOrNext) ? observerOrNext : { next: observerOrNext, error: error, complete: complete });
    }
    _subscribe(observer) {
        const subscriptionObserver = {
            next: observer.next ?? exports.noOp,
            error: observer.next ?? exports.noOp,
            complete: observer.complete ?? exports.noOp
        };
        const subscription = new subscription_1.Subscription(() => {
            subscriptionObserver.next = exports.noOp;
            subscriptionObserver.error = exports.noOp;
            subscriptionObserver.complete = exports.noOp;
        });
        this.behavior(subscriptionObserver);
        return subscription;
    }
}
exports.Observable = Observable;
