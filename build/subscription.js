"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscription = void 0;
class Subscription {
    constructor(teardown) {
        this.teardown = teardown;
        this.id = Symbol();
        this.children = new Map();
        this.closed = false;
    }
    add(subscription) {
        this.children.set(subscription.id, subscription);
    }
    remove(subscription) {
        this.children.delete(subscription.id);
    }
    unsubscribe() {
        if (!this.closed) {
            this.closed = true;
            this.teardown();
        }
        for (const child of this.children.values()) {
            child.unsubscribe();
        }
    }
}
exports.Subscription = Subscription;
