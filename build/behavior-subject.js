"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BehaviorSubjectAltImpl = exports.BehaviorSubject = void 0;
const subject_1 = require("./subject");
const observer_1 = require("./observer");
const replay_subject_1 = require("./replay-subject");
class BehaviorSubject extends subject_1.Subject {
    constructor(initialValue) {
        super();
        this.next = (value) => {
            this.doNext(value);
            this.currentValue = value;
        };
        this.currentValue = initialValue;
    }
    getValue() {
        return this.currentValue;
    }
    subscribe(observerOrNext, error, complete) {
        // Emit current value when subscribing
        if (!this.isComplete && !this.isError) {
            observer_1.isPartialObserver(observerOrNext) ? observerOrNext.next?.(this.currentValue) : observerOrNext?.(this.currentValue);
        }
        return super.subscribe(observerOrNext, error, complete);
    }
}
exports.BehaviorSubject = BehaviorSubject;
class BehaviorSubjectAltImpl extends replay_subject_1.ReplaySubject {
    constructor(initialValue) {
        super(1);
        this.cache.push(initialValue);
    }
    getValue() {
        return this.cache[0];
    }
}
exports.BehaviorSubjectAltImpl = BehaviorSubjectAltImpl;
