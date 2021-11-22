"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplaySubject = void 0;
const subject_1 = require("./subject");
const observer_1 = require("./observer");
class ReplaySubject extends subject_1.Subject {
    constructor(size) {
        super();
        this.size = size;
        this.cache = [];
        this.next = (value) => {
            this.doNext(value);
            this.cache.push(value);
            this.cache = this.cache.slice(-5);
        };
    }
    subscribe(observerOrNext, error, complete) {
        // Emit current value when subscribing
        if (!this.isComplete && !this.isError) {
            const nextFn = observer_1.isPartialObserver(observerOrNext) ? observerOrNext.next : observerOrNext;
            if (nextFn) {
                this.cache.forEach(nextFn);
            }
        }
        return super.subscribe(observerOrNext, error, complete);
    }
}
exports.ReplaySubject = ReplaySubject;
